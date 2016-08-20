/**
 * Created by bwarner on 8/17/16.
 */

(function (_, $) {
    var THROTTLE_INTERVAL = 250;

    function Slide(title, body, url, revisionDate, index) {
        this.title = title;
        this.body = body;
        this.url = url;
        this.index = index;
        this.revisionDate = revisionDate;
        this.element = this.createSlideHtml();
    }

    Slide.prototype.getImage = function () {
        if (!this.image) {
            this.image = new Image();
            this.image.src = this.url;
        }
        return this.image;
    };

    Slide.prototype.createSlideHtml = function generate() {
        var template = document.querySelector('#slide-template').content;
        template = document.importNode(template, true);
        template.querySelector('.slide.slide-title').textContent = this.title;
        template.querySelector('.slide.slide-body').innerHTML = this.body;
        if (this.image) {
            template.querySelector('.slide.slide-image').appendChild(this.image);
        }
        template.querySelector('.slide.slide-container').setAttribute('data-index', this.index);

        return template;
    };

        function SlideShow(dataset) {

            if (!dataset || !dataset.data instanceof Array || !dataset.data[0].slides instanceof Array) {
                return;
            }
            this.queue = [];
            this.current = 0;
            this.sortOrder = '';
            this.$slider = $('.slide.slider');
            this.slides = _.map(dataset.data[0].slides, function (slide, index) {
                return new Slide(slide.title, slide.body, 'http://www.healthline.com' + slide.image.imageUrl, slide.revisionDate, index);
            });
            this.sort('default');
            this.$leftButton = $('.slide.slide-left');
            this.$rightButton = $('.slide.slide-right');
            this.$rightButton.prop('disabled', true);
            this.$leftButton.prop('disabled', false);

            this.$tracking = $('#tracking');

            this.cacheImages(0, 2);

            this.$leftButton.click($.throttle(THROTTLE_INTERVAL, this.slideLeft.bind(this)));
            this.$rightButton.click($.throttle(THROTTLE_INTERVAL, this.slideRight.bind(this)));
            this.$slider.on('transitionend', this.transitionEnd.bind(this));
            $('.slide.slide-radio').on('click', function (event) {
                this.sort(event.target.value);
            }.bind(this));
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

    SlideShow.prototype.transitionEnd = function () {
            $('#current').html(this.current);
            this.$rightButton.prop('disabled', this.current == 0);
        this.$leftButton.prop('disabled', this.current + 1 >= this.slides.length);
        this.$tracking.attr('src', 'http://www.healthline.com/images/clear.gif?' + new Date().getTime());
            this.processCommands();
        };

    SlideShow.prototype.sort = function (newOrder) {
        if (this.sortOrder === newOrder) {
            return;
        }
        this.sortOrder = newOrder;
        this.slides = _.sortBy(this.slides, this.sortOrder === 'default' ? 'revisionDate' : 'title');
        this.slides.forEach(function (slide, index) {
            slide.index = index;
        });
        this.$slider.empty();
        this.loadSlides();
        this.cacheImages(0, this.current + 2);
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

    SlideShow.prototype.loadSlides = function () {
        this.slides.forEach(function (slide, index) {
            this.$slider.append(this.slides[index].createSlideHtml());
        }.bind(this));
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
                this.slideShow = new SlideShow(dataset);
                $('.slide.left-control button')
            }
        );
    }(_, $));
