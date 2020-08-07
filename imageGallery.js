class Gallery {
    constructor(parameters) {
        const {basePath, debug, include = [''], configPath} = parameters;
        this.basePath = basePath ? basePath : 'img';
        this.debug = Boolean(debug);
        this.include = include;
        if (configPath) {
            // Override all configuration if it can be loaded from an external file.
            // Allows for different config for different deploys.
            this.loadExternalConfig(configPath);
        }
        this.slideShow = $("#current-image-container").find("img")[0];
    }

    loadExternalConfig = (configPath) => fetch(configPath)
                .then(response => response.json())
                .then(configs => Object.assign(this, configs))
    
    imgSrcDeconstructor = (src) => {
        const srcWordArray = src.split('/');
        const removeLingering = srcWordArray[srcWordArray.length -1].split('"');
        return removeLingering[0];
    }

    imgSrcConstructor = (imgUrl, size = 1280) => {
        this.log("Gallery: Creating source for main image -",imgUrl);
        return `${this.basePath}/${size}/${imgUrl}`;
    };
    
    createThumbs = (files) => {
        const folders = Object.values(files);
        if(folders.length < 1) {
            this.log('Gallery: Fatal error - No images found', 'error');
            return;
        }
        this.log("Gallery: Initiated with images & folders - ", files);
        const firstImage = Object.values(folders[0])[0];
        this.slideShow.src= `${this.imgSrcConstructor(firstImage.name)}`;
        folders.forEach(folder => {
            const images = Object.values(folder);
            images.forEach(image => {
                const img = document.createElement("img");
                img.src = this.imgSrcConstructor(image.name, 64);
                img.className = 'thumb';
                img.setAttribute("next",image.nextImg);
                img.setAttribute("prev",image.prevImg);
                $("#thumbs-container").append(img)
                img.onclick = () => {
                    this.slideShow.src = `${this.imgSrcConstructor(this.imgSrcDeconstructor(img.src))}`;
                }
            });
        })
    }

    log = (...args) => {
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

    createGallery = () => {
        this.getJsons().then(files => this.createThumbs(files), error => this.log(error, 'error'));
        $("#nav-left").click(function(){
            const currImageSrc = this.slideShow.src;
            const relativeUrl = this.imgSrcConstructor(this.imgSrcDeconstructor(currImageSrc), 64);
            const currThumb = this.getCurrentImageFromThumbs(relativeUrl);
            const prevImg = currThumb.getAttribute('prev')
            if (prevImg.trim()) {
                const prevImageSrc = this.imgSrcConstructor(prevImg);
                this.slideShow.src = `${prevImageSrc}`;
            }
        });
        $("#nav-right").click(function(){
            const currImageSrc = this.slideShow.src;
            const relativeUrl = this.imgSrcConstructor(imgSrcDeconstructor(currImageSrc), 64);
            const currThumb = this.getCurrentImageFromThumbs(relativeUrl);
            const nextImg = currThumb.getAttribute('next');
            if (nextImg.trim()) {
                const nextImageSrc = this.imgSrcConstructor(nextImg);
                this.slideShow.src = `${nextImageSrc}`;
            }
        });
    }

    getCurrentImageFromThumbs = (currentImageSrc) => {
        return $('#thumbs-container').children(`img[src='${currentImageSrc}']`)[0];
    }

    getJsons = async () => {
        const images = {};
        const folders = this.include;
        await folders.forEach(async (folder) =>  {
            await fetch(`${this.basePath}${folder}/images.json`)
                .then(response => response.json())
                .then(
                    data => {
                        const key = folder.length < 1 ? 'main' : folder;
                        images[key] = data
                    }, 
                    error => this.log('Gallery: Failed to construct json of image data -',error, 'error')
                    );
        });
        if(Object.keys(images).length < 1) this.log(`Gallery: Failed to read image jsons for ${this.basePath}${folders}.`, 'error');
        else this.log('Gallery: Read image jsons as - ',images)
        return images;
    }
}




