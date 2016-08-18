/**
 * Created by bwarner on 8/17/16.
 */

    (function(_, $) {

        var CAROUSEL_SELECTOR = ".carousel";

        function SlideShow(dataset) {
            this.queue = [];
            this.state = SlideShow.NONE;
            this.current = 0;
            this.slides = _.map(dataset.data[0].slides, function(slide, index){
                var slide =  {body:slide.body, title:slide.title, url:"http://www.healthline.com"+slide.image.imageUrl, index: index};
                if (index < 2) {
                    slide.img = new Image();
                    slide.img.src = slide.url;
                }
                return slide;
            });
            if (this.slides.length > 0) {
                this.loadSlide($(".left-side"), this.slides[this.current]);
            }
            $(".slide.slide-left").click($.debounce(250, this.slideLeft.bind(this)));
            $(".slide.slide-right").click($.debounce(250, this.slideRight.bind(this)));
            $(".slider").bind("transitionEvent", this.transitionEnd.bind(this));

        }

        SlideShow.NONE = 0;
        SlideShow.SLIDING_LEFT = 1;
        SlideShow.SLIDING_RIGHT = 2;

        SlideShow.prototype.processCommands = function() {
            if (this.queue.length == 0)
                return;
            var cmd = this.queue.pop();
            if (this.state == SlideShow.NONE) {
                if (cmd.name == 'left') {
                    this.prepareToSlideLeft(cmd.name);
                    this.moveLeft();
                }
                else if (cmd.name == 'right') {
                    this.prepareToSlideRight(cmd.name);
                    this.moveRight();
                }
            }
        };

        SlideShow.prototype.transitionEnd = function() {
            if (this.state == SlideShow.SLIDING_LEFT) {
                this.current --;
                this.state == SlideShow.NONE;
            }
            else if (this.state == SlideShow.SLIDING_RIGHT) {
                this.current ++;
                this.state == SlideShow.NONE;
            }
            this.processCommands();
        };

        SlideShow.prototype.moveLeft = function() {
            var slider = $(".slider");
            slider.css({"left": "0px", "right":"auto"});
            slider.addClass("animate");
        };

        SlideShow.prototype.moveRight = function() {
            var slider = $(".slider");
            slider.css({"right": "0px", "left":"auto"});
            slider.addClass("animate");
        };

        SlideShow.prototype.slideLeft = function() {
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

        SlideShow.prototype.backup = function() {
        };

        SlideShow.prototype.loadSlide = function($element, slide) {
            $element.find(".slide.slide-title").html(slide.title);
            $element.find(".slide.slide-image img").replaceWith(slide.img);
            $element.find(".slide.slide-body").replaceWith(slide.body);
        };


        SlideShow.prototype.prefetch = function() {
            var slide, start = this.current + 2,
                end = Math.min(start+2, this.slides.length);
            while (start < end) {
                slide = this.slides[start];
                slide.img = new Image();
                slide.img.src = slide.url;
                console.log("img is ", slide.img);
                start++;
            }
        };

        SlideShow.prototype.prepareToSlideLeft = function() {
            this.prefetch();
            var slider = $(".slider");
            slider.removeClass("animate");
            slider.css({"right":"0px","left":"auto"});
            this.loadSlide($(".left-side"), this.slides[this.current]);
            this.loadSlide($(".right-side"), this.slides[this.current+1]);
        };


        SlideShow.prototype.prepareToSlideRight = function() {
            this.prefetch();
            var slider = $(".slider");
            slider.removeClass("animate");
            slider.css({"left":"0px","right":"auto"});
            this.loadSlide($(".left-side"), this.slides[this.current+1]);
            this.loadSlide($(".right-side"), this.slides[this.current]);
        };

        $.getJSON("https://api.healthline.com/api/service/2.0/slideshow/content?partnerId=7eef498c-f7fa-4f7c-81fd-b1cc53ac7ebc&contentid=17103&includeLang=en&callback=?", null,
            function(dataset) {
                var slideShow = new SlideShow(dataset);
                $(".slide.left-control button")
            }
        );

    }(_, $));
