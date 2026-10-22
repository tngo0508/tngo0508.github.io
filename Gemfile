source "https://rubygems.org"

# Use github-pages gem for better GitHub Pages compatibility
# Pinned: an unpinned resolve can pick github-pages 222 (Liquid 4.0.3), which crashes on Ruby 3.2+.
# Match the version GitHub Pages runs (https://pages.github.com/versions/).
gem "github-pages", "232", group: :jekyll_plugins
gem "jekyll-include-cache", group: :jekyll_plugins

# Theme - using remote_theme in _config.yml instead
# gem "minimal-mistakes-jekyll"

# Windows-specific gems
if Gem.win_platform?
  gem 'tzinfo-data'
end

# Additional gems for Ruby 3.4+ compatibility
gem 'csv'
gem 'base64'
gem 'webrick'