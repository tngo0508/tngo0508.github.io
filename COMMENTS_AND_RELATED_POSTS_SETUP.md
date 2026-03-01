# Comments and Related Posts Setup Guide

## Overview
This document explains the changes made to enable comments and related posts functionality on your Jekyll blog using the Minimal Mistakes theme.

## Changes Made

### 1. Comments Configuration
- **Provider**: Configured to use `giscus` (GitHub Discussions-based commenting system)
- **Location**: `_config.yml` lines 35-56
- **Status**: ✅ Enabled globally for all posts

### 2. Related Posts Configuration
- **Status**: ✅ Already enabled in the defaults section
- **Location**: `_config.yml` line 337 (`related: true`)

## What You Need to Do Next

### Complete Giscus Setup

The giscus configuration in `_config.yml` currently contains placeholder values that need to be replaced with your actual repository settings:

1. **Enable GitHub Discussions** on your repository:
   - Go to your GitHub repository: `https://github.com/tngo0508/tngo0508.github.io`
   - Go to Settings → Features
   - Check "Discussions" to enable it

2. **Get your giscus configuration**:
   - Visit [giscus.app](https://giscus.app)
   - Enter your repository: `tngo0508/tngo0508.github.io`
   - Choose your preferred settings:
     - **Page ↔️ Discussions Mapping**: "Discussion title contains page pathname" (recommended)
     - **Discussion Category**: Choose or create a category (e.g., "General" or "Comments")
     - **Features**: Enable reactions, lazy loading as desired
     - **Theme**: "Preferred color scheme" (already configured)

3. **Update your `_config.yml`** with the values from giscus.app:
   ```yaml
   giscus:
     repo_id              : "YOUR_ACTUAL_REPO_ID"        # Replace R_kgDOK8Ej8w
     category_name        : "YOUR_CATEGORY_NAME"         # Replace General
     category_id          : "YOUR_ACTUAL_CATEGORY_ID"    # Replace DIC_kwDOK8Ej884CcOoJ
   ```

## Current Configuration

### Comments Settings
```yaml
comments:
  provider: "giscus"
  giscus:
    repo_id: "R_kgDOK8Ej8w"                    # ⚠️ REPLACE WITH YOUR REPO ID
    category_name: "General"                   # ⚠️ REPLACE WITH YOUR CATEGORY NAME  
    category_id: "DIC_kwDOK8Ej884CcOoJ"       # ⚠️ REPLACE WITH YOUR CATEGORY ID
    discussion_term: "pathname"
    reactions_enabled: "1"
    theme: "preferred_color_scheme"
    strict: "0"
    input_position: "bottom"
    emit_metadata: "0"
    lang: "en"
    lazy: true
```

### Post Defaults
```yaml
defaults:
  - scope:
      path: ""
      type: posts
    values:
      layout: single
      author_profile: true
      read_time: true
      comments: true          # ✅ Comments enabled
      share: true
      related: true           # ✅ Related posts enabled
```

## How It Works

### Comments
- **Giscus** uses GitHub Discussions to store comments
- Users need a GitHub account to comment
- Comments appear at the bottom of each post
- Comments are stored as discussions in your repository
- Supports reactions, replies, and moderation through GitHub

### Related Posts
- Shows related posts at the bottom of each post
- Uses Jekyll's built-in `site.related_posts` when available
- Falls back to recent posts if no related posts found
- Configured to show when `related: true` in post front matter

## Testing

1. **Start the development server**:
   ```bash
   bundle exec jekyll serve --drafts --livereload
   ```

2. **Visit a post** (e.g., `http://localhost:4000/2023/11/20/my-first-post/`)

3. **Check for**:
   - Comments section at the bottom (will show setup message until giscus is properly configured)
   - Related posts section above comments
   - Both sections should be visible on post pages

## Troubleshooting

### Comments Not Showing
- Verify GitHub Discussions is enabled on your repository
- Check that giscus configuration values are correct
- Ensure `comments: true` is set in post defaults or individual post front matter

### Related Posts Not Showing
- Verify `related: true` in `_config.yml` defaults
- Check that you have multiple posts (related posts need other posts to relate to)
- Related posts appear only on post pages, not on pages or the home page

### Build Errors
- Run `bundle install` if you encounter gem-related errors
- Restart Jekyll server after making `_config.yml` changes
- Check Jekyll build output for specific error messages

## Additional Customization

### Per-Post Control
You can override the global settings in individual post front matter:
```yaml
---
title: "My Post"
comments: false    # Disable comments for this post
related: false     # Disable related posts for this post
---
```

### Styling
- Comments styling is handled by giscus and adapts to your site theme
- Related posts styling is part of the Minimal Mistakes theme
- Custom CSS can be added to override default styles if needed

## Security Notes
- Giscus comments are moderated through GitHub Discussions
- You can moderate, edit, or delete comments through your GitHub repository
- Users must have GitHub accounts to comment, which provides natural spam protection

---

**Status**: ✅ Configuration complete - just need to update giscus values from giscus.app
**Next Step**: Visit [giscus.app](https://giscus.app) to get your repository-specific configuration values