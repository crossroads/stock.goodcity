# This Rakefile assists in creating Cordova app builds. It provides a consistent
# build process on dev machines, CI servers and is cross-platform.
#
# Tasks overview
#   rake app:build (default)
#   rake app:deploy (upload to Azure storage for live builds)
#   rake app:release (build and upload to Azure storage for live builds)
#
# Defaults:
#   ENV=staging PLATFORM=<based on host machine: darwin -> ios, linux -> android>
#
# Advanced usage
#   Specify ENVIRONMENT params or call special task
#     > rake android production app:build
#     > ENV=production PLATFORM=android rake app:build (equivalant to above)
#   Other tasks
#     > rake clean (removes dist, cordova/www and app files)
#     > rake clobber (also removes cordova/platforms and cordova/plugins)
#     > rake cordova:prepare
#     > rake cordova:build
#
#     Cronjob entry
# * * * * * source /Users/developer/.bash_profile; rake -f /Users/developer/Workspace/app.goodcity/Rakefile app:release  >> /tmp/goodcity_app_ios_build.log 2>&1
#
# Signing Android releases
#   Gradle can sign the releases during the build process.
#   Set environment varibles: GOODCITY_KEYSTORE_PASSWORD and GOODCITY_KEYSTORE_ALIAS
#   You must also ensure the signing key exists at CORDOVA/goodcity.keystore
require "json"
require "fileutils"
require "rake/clean"
require 'plist'
require 'nokogiri'

ROOT_PATH = File.dirname(__FILE__)
CORDOVA_PATH = "#{ROOT_PATH}/cordova".freeze
CONFIG_XML_PATH = "#{CORDOVA_PATH}/config.xml".freeze
CLEAN.include("dist", "cordova/www", "#{CORDOVA_PATH}/platforms/android/build",
  "#{CORDOVA_PATH}/platforms/ios/build")
CLOBBER.include('cordova/platforms', 'cordova/plugins')
PLATFORMS = %w[android ios windows].freeze
ENVIRONMENTS = %w[staging production].freeze
TESTFAIRY_PLUGIN_URL = 'https://github.com/testfairy/testfairy-cordova-plugin'.freeze
TESTFAIRY_PLUGIN_NAME = 'com.testfairy.cordova-plugin'.freeze
KEYSTORE_FILE = "#{CORDOVA_PATH}/goodcity.keystore".freeze
BUILD_JSON_FILE = "#{CORDOVA_PATH}/build.json".freeze

# Helper method
def add_plugin(name, version, variables = {})
  xml = File.read(CONFIG_XML_PATH)
  doc = Nokogiri.XML(xml)
  widget = doc.at_css('widget')

  plugin = Nokogiri::XML::Node.new "plugin", doc
  plugin['spec'] = version
  plugin['name'] =  name

  variables.each do |n, v|
    var = Nokogiri::XML::Node.new "variable", doc
    var['name'] = n
    var['value'] = v
    plugin.add_child(var)
  end

  widget.add_child(plugin)

  File.write(CONFIG_XML_PATH, doc.to_xml)
end

# Default task
task default: %w[app:build]

# Main namespace
namespace :app do
  desc 'Builds the app'
  task build: %w[cordova:prepare cordova:build]
  desc 'Uploads the app to Azure storage'
  task deploy: %w[azure:upload]
  desc 'Equivalent to rake app:build app:deploy'
  task release: %w[app:build azure:upload]
end

ENVIRONMENTS.each do |env|
  task env do
    ENV["ENV"] = env
  end
end

PLATFORMS.each do |platform|
  task platform do
    ENV["PLATFORM"] = platform
  end
end

namespace :cordova do
  desc "Cordova prepare {platform}"
  task :prepare do
    create_build_json_file
    sh %{ ln -s "#{ROOT_PATH}/dist" "#{CORDOVA_PATH}/www" } unless File.exists?("#{CORDOVA_PATH}/www")
    build_details.map{|key, value| log("#{key.upcase}: #{value}")}
    sh %{ cd #{CORDOVA_PATH}; cordova-update-config --appname "#{app_name}" --appid #{app_id} --appversion #{app_version} }

    #Temporary fix for phonegap-plugin-push
    if platform == 'android'
      add_plugin('phonegap-plugin-push', '2.1.2')
    elsif platform == 'ios'
      add_plugin('phonegap-plugin-push', '2.3.0', { SENDER_ID: 'XXXXXXX' })
    end

    log("Preparing app for #{platform}")
    Dir.chdir(CORDOVA_PATH) do
      system({"ENVIRONMENT" => environment}, "cordova prepare #{platform}")
    end

    if platform == "ios"
      Dir.chdir(CORDOVA_PATH) do
        sh %{ cordova plugin add #{TESTFAIRY_PLUGIN_URL} } if environment == "staging"
        sh %{ cordova plugin remove #{TESTFAIRY_PLUGIN_NAME}; true } if environment == "production"
      end
    end
  end

  desc "Cordova build {platform}"
  task build: :prepare do
    Dir.chdir(CORDOVA_PATH) do
      build = (environment == "staging" && platform == 'android') ? "debug" : "release"
      extra_params = (platform === "android") ? '' : ios_build_config
      system({"ENVIRONMENT" => environment}, "cordova compile #{platform} --#{build} --device #{extra_params}")
    end
  end
end

namespace :azure do
  task :upload do
    if environment != "production"
      log("Environment: #{environment}. Skipping Azure upload")
      next
    end
    raise(BuildError, "#{app_file} does not exist!") unless File.exists?(app_file)
    raise(BuildError, "AZURE_HOST not set.") unless env?("AZURE_HOST")
    raise(BuildError, "AZURE_SHARE not set.") unless env?("AZURE_SHARE")
    raise(BuildError, "AZURE_SAS_TOKEN not set.") unless env?("AZURE_SAS_TOKEN")
    if ENV["CI"]
      sh %{ source ~/.circlerc; PATH=$(npm bin):$PATH; azure-filestore upload -d #{platform} -f "#{app_file}" -t #{azure_file} }
    end
    log("Uploaded app to azure...")
    build_details.map{|key, value| log("#{key.upcase}: #{value}")}
  end
end

def app_sha
  Dir.chdir(ROOT_PATH) do
    `git rev-parse --short HEAD`.chomp
  end
end

def environment
  environment = ENV["ENV"]
  raise(BuildError, "Unsupported environment: #{environment}") if (environment || "").length > 0 and !ENVIRONMENTS.include?(environment)
  ENV["ENV"] || "staging"
end

def platform
  env_platform = ENV["PLATFORM"]
  raise(BuildError, "Unsupported platform: #{env_platform}") if (env_platform || "").length > 0 and !PLATFORMS.include?(env_platform)
  env_platform || begin
    case Gem::Platform.local.os
    when /mswin|windows|mingw32/i
      "windows"
    when /linux|arch/i
      "android"
    when /darwin/i
      "ios"
    else
      raise(BuildError, "Unsupported build os: #{env_platform}")
    end
  end
end

def env?(env)
  (ENV[env] || "") != ""
end

def app_file
  case platform
  when /ios/
    "#{CORDOVA_PATH}/platforms/ios/build/device/#{app_name}.ipa"
  when /android/
    build = is_staging ? "debug" : "release"
    "#{CORDOVA_PATH}/platforms/android/build/outputs/apk/android-#{build}.apk"
  when /windows/
    raise(BuildError, "Need to get Windows app path")
  end
end

def azure_file
  case platform
  when /ios/
    extn = "ipa"
  when /android/
    extn = "apk"
  end
  "#{app_id}-#{app_version}.#{extn}"
end

def app_name
  is_staging ? "S. Stock" : "Stock"
end

def app_id
  is_staging ? "hk.goodcity.stockstaging" : "hk.goodcity.stock"
end

def app_version
  package_json = File.open(File.join(File.expand_path('../',  __FILE__), 'package.json'), 'r').read
  version_number = JSON.parse(package_json)['version']
  if is_staging
    "#{version_number}.#{ENV['CIRCLE_BUILD_NUM']||ENV['BUILD_BUILDNUMBER']}"
  else
    version_number
  end
end

def mobile_provisioning_file
  prefix = ['~', 'Library', 'MobileDevice', 'Provisioning\ Profiles']
  file = if production_env?
      "GoodCityStock.mobileprovision"
    else
      "GoodCityStockStaging.mobileprovision"
    end
  File.join(prefix, file)
end

def mobile_provisioning_plist
  @mobile_provisioning_plist ||= begin
    profile = `openssl smime -inform der -verify -noverify -in #{mobile_provisioning_file}`
    Plist.parse_xml(profile)
  end
end

def ios_build_config
  opts = {}
  opts["developmentTeam"] = mobile_provisioning_plist["TeamIdentifier"].first
  opts["automaticProvisionin"] = false
  opts["buildFlag"] = '-UseModernBuildSystem=0'
  opts["provisioningProfile"] = mobile_provisioning_plist["UUID"]
  if production_env?
    opts["codeSignIdentity"] = "\'iPhone Distribution\'"
    opts["packageType"] = "app-store"
    opts["icloud_container_environment"] = "Production"
  else
    opts["codeSignIdentity"] = "\'iPhone Developer\'"
    opts["packageType"] = 'development'
    opts["icloud_container_environment"] = "Development"
  end
  opts.map do |key, value|
    "--#{key}=#{value}"
  end.join(" ")
  #" --codeSignIdentity=#{code_signing} --developmentTeam=#{team_id} --packageType=#{package_type} --provisioningProfile=\'#{provisioning_profile}\' --automaticProvisionin=#{signing_style} --icloud_container_environment=#{icloud_container_environment}"
end

def is_staging
  environment == 'staging'
end

def production_env?
  environment == 'production'
end

def build_details
  {app_name: app_name, env: environment, platform: platform, app_version: app_version}
end

def log(msg="")
  puts(Time.now.to_s << ' ' << msg)
end

# Cordova uses build.json to create gradle release-signing.properties file
# Expects CORDOVA_PATH/goodcity.keystore to exist
# Requires ENV vars: GOODCITY_KEYSTORE_PASSWORD and GOODCITY_KEYSTORE_ALIAS
def create_build_json_file
  FileUtils.rm(BUILD_JSON_FILE) if File.exist?(BUILD_JSON_FILE)
  return unless (environment == 'production' and platform == 'android')
  raise(BuildError, "Keystore file not found: #{KEYSTORE_FILE}") unless File.exists?("#{KEYSTORE_FILE}")
  %w(GOODCITY_KEYSTORE_PASSWORD GOODCITY_KEYSTORE_ALIAS).each do |key|
    raise(BuildError, "#{key} environment variable not set.") unless env?(key)
  end
  build_json_hash = {
    android: {
      release: {
        keystore: "#{KEYSTORE_FILE}",
        storePassword: ENV["GOODCITY_KEYSTORE_PASSWORD"],
        alias: ENV["GOODCITY_KEYSTORE_ALIAS"],
        password: ENV["GOODCITY_KEYSTORE_PASSWORD"]
      }
    }
  }
  File.open(BUILD_JSON_FILE, "w"){|f| f.puts JSON.pretty_generate(build_json_hash)}
end

class BuildError < StandardError; end
