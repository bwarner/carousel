/**
 * Created by bwarner on 8/17/16.
 */

function Template(id) {
    this.templateId = id;
}

Template.prototype.interpolate = function generate(title, body, imgUrl) {
    var $template = $(document.querySelector('#slide-template').content);
    $template.find('.slide .slide-title').text(title);
    $template.find('.slide .slide-body').html(body);
    $template.find('.slide .slide-image-img').attr('src', imgUrl);
    return $template;
};
    (function(_, $) {

        var CAROUSEL_SELECTOR = '.carousel';


        function SlideShow(dataset) {
            this.queue = [];
            this.state = SlideShow.NONE;
            this.current = 0;
            this.template = new Template('#slide-template');
            this.slides = _.map(dataset.data[0].slides, function(slide, index){
                var slide =  {body:slide.body, title:slide.title, url:'http://www.healthline.com'+slide.image.imageUrl, index: index};
                if (index < 2) {
                    slide.img = new Image();
                    slide.img.src = slide.url;
                }
                return slide;
            });
            this.slides.forEach(function(slide, index) {
                this.loadSlide(index);
            }.bind(this));
            this.$slider = $('.slider');

            $('.slide.slide-left').click($.debounce(250, this.slideLeft.bind(this)));
            $('.slide.slide-right').click($.debounce(250, this.slideRight.bind(this)));
            $('.slider').on('transitionend', this.transitionEnd.bind(this));
            $('#current').html(this.current);
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

        SlideShow.prototype.transitionEnd = function(e) {
            console.log('end animation', e);
            if (this.state == SlideShow.SLIDING_LEFT) {
                this.current ++;
                this.state = SlideShow.NONE;
            }
            else if (this.state == SlideShow.SLIDING_RIGHT) {
                this.current --;
                this.state = SlideShow.NONE;
            }
            $('#current').html(this.current);
            this.processCommands();
        };

        SlideShow.prototype.moveLeft = function() {
            this.state = SlideShow.SLIDING_LEFT;
                var pos = this.current * 100;
                this.$slider.css({'left': '-' + pos + '%'});
        };

        SlideShow.prototype.moveRight = function() {
            this.state = SlideShow.SLIDING_RIGHT;
            var pos = this.current * 100;
            this.$slider.css({'left': '-' + pos + '%'});
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
        SlideShow.prototype.loadSlide = function(index) {
            var $slider = $('.slider'),
                slide = this.slides[index];

            $slider.append(this.template.interpolate(slide.title, slide.body, slide.url));
        };


        SlideShow.prototype.prefetch = function() {
            var slide, start = this.current + 2,
                end = Math.min(start+2, this.slides.length);
            while (start < end) {
                slide = this.slides[start];
                slide.img = new Image();
                slide.img.src = slide.url;
                start++;
            }
        };

        SlideShow.prototype.prepareToSlideLeft = function() {
            this.prefetch();
            // this.loadSlide($('.left-side'), this.slides[this.current]);
            // setTimeout(function() {
            //     var slider = $('.slider');
            //     slider.removeClass('animate');
            //     slider.css({'left': '0'});
            // });
            // this.loadSlide($('.right-side'), this.slides[this.current+1]);
        };


        SlideShow.prototype.prepareToSlideRight = function() {
            this.prefetch();
            // this.loadSlide($('.right-side'), this.slides[this.current+1]);
            // setTimeout(function() {
            //     var slider = $('.slider');
            //     slider.removeClass('animate');
            //     slider.css({'left':'-100%'});
            // });
            // this.loadSlide($('.left-side'), this.slides[this.current]);
        };

        $.getJSON('https://api.healthline.com/api/service/2.0/slideshow/content?partnerId=7eef498c-f7fa-4f7c-81fd-b1cc53ac7ebc&contentid=17103&includeLang=en&callback=?', null,
            function(dataset) {
                var slideShow = new SlideShow(dataset);
                $('.slide.left-control button')
            }
        );

    }(_, $));
