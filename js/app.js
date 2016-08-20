/**
 * Created by bwarner on 8/17/16.
 */

function Slide(title, body, url, index) {
    this.title = title;
    this.body = body;
    this.url = url;
    this.index = index;
    this.element = this.createSlideHtml();
}

Slide.prototype.loadImage = function() {
   this.image = new Image();
    this.image.src = this.url;
};

Slide.prototype.getImage = function() {
    if (!this.image) {
        this.image = new Image();
        this.image.src = this.url;
    }
    return this.image;
};

Slide.prototype.createSlideHtml = function generate() {
    var template = document.querySelector('#slide-template').content;
    template.querySelector('.slide.slide-title').textContent = this.title;
    template.querySelector('.slide.slide-body').innerHTML = this.body;
    // template.querySelector('.slide.slide-image').setAttribute('src', imgUrl);
    if (this.image) {
        template.querySelector('.slide.slide-image  ').appendChild(this.image);
    }
    template.querySelector('.slide.slide-container').setAttribute('data-index', this.index);

    return document.importNode(template, true);
};
    (function(_, $) {

        var CAROUSEL_SELECTOR = '.carousel';


        function SlideShow(dataset) {
            this.queue = [];
            this.current = 0;
            this.fetched = 0;
            this.slides = _.map(dataset.data[0].slides, function (slide, index) {
                return new Slide(slide.title, slide.body, 'http://www.healthline.com' + slide.image.imageUrl, index);
            });
            this.$slider = $('.slider');
            this.$leftButton  = $('.slide.left-control');
            this.$rightButton = $('.slide.right-control');
            this.$rightButton.prop('disable', true);

            this.slides.forEach(function (slide, index) {
                this.loadSlide(index);
            }.bind(this));
            this.cacheImages(0, 2);

            $('.slide.slide-left').click($.throttle(250, this.slideLeft.bind(this)));
            $('.slide.slide-right').click($.throttle(250, this.slideRight.bind(this)));
            $('.slider').on('transitionend', this.transitionEnd.bind(this));
            $('#current').html(this.current);
        }

        SlideShow.prototype.processCommands = function() {
            if (this.queue.length == 0)
                return;
            var cmd = this.queue.pop();
            if (cmd.name == 'left') {
                this.moveLeft();
            }
            else if (cmd.name == 'right') {
                this.moveRight();
            }
        };

        SlideShow.prototype.transitionEnd = function(e) {
            $('#current').html(this.current);
            this.$rightButton.prop('disabled', this.current == 0);
            this.$rightButton.prop('disabled', this.current + 1 > this.slides.length);

            this.processCommands();
        };

        SlideShow.prototype.moveLeft = function() {
            this.current ++;
            var pos = this.current * 100 ;
            this.$slider.css({'left': '-' + pos + '%'});
        };

        SlideShow.prototype.moveRight = function() {
            this.current --;
            var pos = this.current * 100;
            this.$slider.css({'left': '-' + pos + '%'});
        };

        SlideShow.prototype.slideLeft = function() {
            this.prefetch();
            if (this.current+1 < this.slides.length) {
                this.queue.push({name: 'left'});
                this.processCommands();
            }
        };

        SlideShow.prototype.slideRight = function() {
            if (this.current > 0) {
                this.queue.push({name: 'right'});
                this.processCommands();
            }
        };
        SlideShow.prototype.loadSlide = function(index) {
            this.$slider.append(this.slides[index].createSlideHtml());
        };

        SlideShow.prototype.cacheImages = function(start, len) {
            var end = Math.min(start+len, this.slides.length);
            while (start < end) {
                var slide = this.slides[start];
                var $element = $('.slide.slide-container[data-index='+start+'] .slide-image');
                if ($element  && $element.children().length == 0) {
                    $element.append(slide.getImage());
                }
                start++;
            }
        };

        SlideShow.prototype.prefetch = function() {
            this.cacheImages(this.current + 2 + this.current % 2, 2);
        };

        $.getJSON('https://api.healthline.com/api/service/2.0/slideshow/content?partnerId=7eef498c-f7fa-4f7c-81fd-b1cc53ac7ebc&contentid=17103&includeLang=en&callback=?', null,
            function(dataset) {
                var slideShow = new SlideShow(dataset);
                $('.slide.left-control button')
            }
        );

    }(_, $));
