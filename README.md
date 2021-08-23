# Pied Piper
### Minimal image compression application inspired by [tinyjpg](https://tinyjpg.com/), with better compression factor
[![Netlify Status](https://api.netlify.com/api/v1/badges/4f1254df-9ef0-4358-bd2d-3f2314bb02ed/deploy-status)](https://app.netlify.com/sites/piedpiperhub/deploys)
### live @ https://piedpiperhub.netlify.app/

### Stack
- Vanilla JS
- [imagemin](https://www.npmjs.com/package/imagemin)
- [FileSaver](https://www.npmjs.com/package/file-saver)

## Features
- Drag and Drop upto 20 images (max size: 4 MB)
- Links to download individual compressed files
- Zip and download multiple files
  
    ### ToDo:
    - File/s upload indicator for better user experience.
    - Allow user to click/tap in the dropzone to upload files.
    - Refactor error handling and code in general

## Learnings
- Got to know how Base64 encoding converts images into a readable string for lossless data transfer.
- Worked with FileSaver pacakge to generate zipped files.
- Learned about Netlify Serverless Functions.   

## Challenges
- Customizing error handling logic of unsupported files.
- Integrating FileSaver package multiple files zip feature.

## Prospective
- Expand the scope to compress PDF files as well.

### Attributions:
- Inspired by [Tiny JPG](https://tinyjpg.com/)
- Tutorial by [Dave Gray](https://www.youtube.com/watch?v=jEjo9UytpIc)
- Project name inspiration: [Silicon Valley](https://www.hbo.com/silicon-valley)


