# WIP: ImageGallery
There are many image galleries, but this one is mine.


```bash
git clone
```  

Add the Image Gallery to your `<head>`-tag **_before_** any scripts using it.
```HTML
<script src="[Path-to-imageGallery.js]" />
```

Create the 4 elements needed:
 - #current-image-container
    - An image-tag as child
 - #thumbs-container
 - #nav-left
 - #nav-right

 Their order are not relevant, style and order as you desire.
```html
<div id="current-image-container" alt="slideshow">
    <img src=""/>
</div>

<div id="thumbs-container"></div>

<button class="img-nav-button" id="nav-left">&lt;</button>

<button class="img-nav-button" id="nav-right">&gt;</button>

```

Initialize the gallery.
```js
const gallery = new Gallery();
```

The Gallery takes one (1) object as argument, with keys:
```js
{
    basePath: string, // Default: '/img/'.
    casing: 'lower' | 'upper' | 'original', //Default: 'original'. Overrides image names of json-files.
    configPath: string | undefined, // Default: undefined. Path to external config, which overrides local settings.
    debug: boolean, // Default: false.
    include: [], // Default: ['']. Folder names if images should be found in subdirectories.
    sizeFormat: undefined | 'inPath' | { [key: string]: value} // Default: undefined. The options are: 'inPath', meaning the images of different sizes can be found at '${basePath}/${size}/${folder}'. 'key: value', being params appended to the url, or no definition, indicating that all images are of static size. Width & height are treated as special keywords, which are considered the format of the key-part of the query. E.g. "width": "w".
}
```


