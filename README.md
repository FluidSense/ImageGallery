# ImageGallery
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
    basePath: string,
    debug: boolean,
    include: [] // Only needed if images are sorted in different folders.
}
```


