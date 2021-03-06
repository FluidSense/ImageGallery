class Gallery {
    constructor(parameters) {
        const { 
            basePath,
            casing = 'original',
            configPath,
            debug,
            include = [''],
            sizeFormat
        } = parameters;

        this.basePath = basePath ? basePath : 'img';
        this.debug = Boolean(debug);
        this.include = include;
        this.casing = casing;
        this.sizeFormat = sizeFormat;
        this.slideShow = document.querySelector("#current-image-container img");

        if (configPath) {
            // Override all configuration if it can be loaded from an external file.
            // Allows for different config for different deploys.
            this.loadExternalConfig(configPath);
        }
    }

    loadExternalConfig = (configPath) => fetch(configPath)
                .then(response => response.json())
                .then(configs => Object.assign(this, configs))
    

    convertSrcToCasing = (imgUrl) => {
        switch (this.casing) {
            case 'original':
                return imgUrl;
            case 'lower':
                return imgUrl.toLowerCase();
            case 'upper':
                return imgUrl.toUpperCase();
        }
    }

    imgSrcConstructor = (imgUrlOrigin, size = 1280) => {
        const imgUrl = this.convertSrcToCasing(imgUrlOrigin);
        this.log("Gallery: Creating source for main image -",imgUrl);
        // Either add the deciding size in path before img name, or use a query for API's.
        if (this.sizeFormat === 'inPath') return `${this.basePath}/${size}/${imgUrl}`;
        
        // Append any URL-params for API's.
        if (typeof this.sizeFormat === 'object') {
            const { width, height, ...rest } = this.sizeFormat; 
            const params = Object.entries(rest).reduce((acc, [key, value]) => `${acc}${key}=${value}&`, '');
            const sizeKey = width ? width : height; 
            return `${this.basePath}/${imgUrl}?${params}${sizeKey}=${size}`;
        }
        // Default case: No sizes, all image sizes are final.
        return `${this.basePath}/${imgUrl}`;
    };

    getImgNameFromSrc = (src) => {
        const srcWordArray = src.split('/');
        const removedPath = srcWordArray[srcWordArray.length -1].split('"')[0];
        const withoutQuery = removedPath.split("?")[0];
        return withoutQuery;
    }
    
    createThumbs = (files) => {
        const folders = Object.values(files);
        // A folder structure is enforced in the JSON, and if not, created in an earlier step.
        if(folders.length < 1) {
            this.log('Gallery: Fatal error - No images found', 'error');
            return;
        }
        this.log("Gallery: Initiated with images & folders - ", files);
        const allThumbs = folders.map(folder => {
            const images = Object.values(folder);
            const thumbs = images.map(image => {
                const thumb = new Thumb(image, this.imgSrcConstructor, this.getImgNameFromSrc);
                thumb.setOnClick(this.slideShow);
                return thumb;
            });
            return thumbs;
        })
        return new ThumbsContainer(allThumbs);
    }

    setInitialImage = (thumbContainer) => {
        const firstImage = thumbContainer.getInitialImage();
        this.slideShow.src=`${this.imgSrcConstructor(firstImage.name)}`;
    }

    log = (...args) => {
        // A wrapper around console.error and console.warn.
        if (!this.debug) return;
        const isMultiprint = Array.isArray(args);
        const types = ['error', 'warning']
        const hasType = isMultiprint ? args.some(val => types.includes(val)) : false;
        if(hasType) {
            const type = args.pop();
            if (type === 'error') {
                if (isMultiprint) console.error(...args);
                else console.error(args);
            }
        }
        else if(isMultiprint) console.log(...args);
        else console.log(args);
    }

    navigation = (attributeName) => {
        const currImageSrc = this.slideShow.src;
        const relativeUrl = this.imgSrcConstructor(this.getImgNameFromSrc(currImageSrc), 64);
        const currThumb = this.getCurrentImageFromThumbs(relativeUrl);
        const upcomingImg = currThumb.getAttribute(attributeName)
        if (upcomingImg.trim()) {
            const upcomingImageSrc = this.imgSrcConstructor(upcomingImg);
            this.slideShow.src = `${upcomingImageSrc}`;
        }
    } 

    createGallery = () => {
        this.getJsons()
            .then(
                files => this.createThumbs(files),
                error => this.log(error, 'error')
            )
            .then(thumbContainer => this.setInitialImage(thumbContainer));

        // Initiate next and prev-buttons from navigation template function.
        document.getElementById("nav-left").onclick = () => this.navigation('data-prev')
        document.getElementById("nav-right").onclick = () => this.navigation('data-next');
    }

    getJsons = async () => {
        const images = {};
        const folders = this.include;
        const fetches = folders.map((folder) =>  {
            return fetch(`${this.basePath}${folder}/images.json`)
                .then(response => response.json())
                .then(
                    data => {
                        const key = folder.length < 1 ? 'main' : folder;
                        images[key] = data
                    }, 
                    error => this.log('Gallery: Failed to construct json of image data -',error, 'error')
                    );
        });
        await Promise.all(fetches);
        if(Object.keys(images).length < 1) this.log(`Gallery: Failed to read image jsons for ${this.basePath}${folders}.`, 'error');
        else this.log('Gallery: Read image jsons as - ',images)
        return images;
    }
}

class ThumbsContainer {
    thumbs = [];

    constructor(thumbs, containerName) {
        this.element = this.getDOMContainer(containerName);
        this.thumbs = thumbs;
        thumbs.forEach(thumb => this.element.appendChild(thumb.element));
    }
    
    getInitialImage = () => {
        return this.thumbs[0];
    }

    getDOMContainer = (containerName) => {
        if (containerName) {
            return document.getElementById(containerName);
        }
        return document.getElementById('thumbs-container');
    }

    getThumbForCurrentImage = (currentImageSrc) => {
        return document.querySelector(`div.thumbs-container img[src=${currentImageSrc}]`)
    }

}

class Thumb {
    constructor(image, pathConstructor, imgNameFromPath){
        img = document.createElement("img");
        this.element = img;
        this.pathConstructor = pathConstructor;
        this.imgNameFromPath = imgNameFromPath;
        img.src = this.pathConstructor(image.name, 64);
        img.className = 'thumb';
        img.setAttribute("data-next",image.nextImg);
        img.setAttribute("data-prev",image.prevImg);
    }

    setOnClick = (slideShow) => {
        this.element.onclick = () => {
            slideShow.src = `${this.pathConstructor(this.imgNameFromPath(img.src))}`;
        }
    }
}




