$(function () {

    var singleCarPage = $('.single-car, .search-car');

    singleCarPage.on('click', function (e) {

        if (singleCarPage.hasClass('visible')) {

            var clicked = $(e.target);

            if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
                createQueryHash();
            }

        }

    });



    var carsIds,
        prefix = "car_id_",
        carsIds_key = "car_ids",
        cars = [],
        filters = {};

    $.getJSON("cars.json", function (data) {
        carsIds = $.map(data, function (car) {
            var stringified = JSON.stringify(car);
            localStorage.setItem(prefix + car.id, stringified);
            return car.id;
        });

        localStorage.setItem(carsIds_key, JSON.stringify(carsIds));

        cars = data;
        generateAllCarsHTML(cars);
        generateSearchCarsHTML(cars);

        $(window).trigger('hashchange');
    });

    $(window).on('hashchange', function () {
        render(decodeURI(window.location.hash));
    });



    function render(url) {

        var temp = url.split('/')[0];
        $('.main-content .page').removeClass('visible');


        var map = {

            '': function () {
                renderCarsPage(cars);
            },

            '#car': function () {
                var index = url.split('#car/')[1].trim();
                renderSingleCarPage(index, cars);
            },

            '#search': function () {
                url.split('#search/');
                filters = {};
                checkboxes.prop('checked',false);

                renderSearchCarsPage(cars)
            },

            '#filter': function() {

                url = url.split('#filter/')[1].trim();

                try {
                    filters = JSON.parse(url);
                }

                catch(err) {
                    window.location.hash = '#';
                    return;
                }

                renderFilterResults(filters, cars);
            }


        };

        if (map[temp]) {
            map[temp]();
        }

        else {
            renderErrorPage();
        }

    }

    function generateSearchCarsHTML(data) {
        var list = $('.search-car .search-large');
        var theTemplateScript = $("#some-template").html();

        var theTemplate = Handlebars.compile(theTemplateScript);
        list.append(theTemplate(data));
    }


    function generateAllCarsHTML(data) {

        var list = $('.all-cars .cars-list');

        var search = $('html');

        var theTemplateScript = $("#cars-template").html();

        var theTemplate = Handlebars.compile(theTemplateScript);
        list.append(theTemplate(data));


        list.find('li').on('click', function (e) {
            e.preventDefault();

            var carIndex = $(this).data('index');

            window.location.hash = 'car/' + carIndex;
        });

        search.find(".search").on("click", function (e) {
            e.preventDefault();
            window.location.hash = 'search'
        });
    }



    function renderCarsPage(data) {

        var page = $('.all-cars'),
            allCars = $('.all-cars .cars-list > li');

        //allCars.addClass('hidden');

        allCars.each(function () {

            var that = $(this);

            data.forEach(function (item) {
                if (that.data('index') == item.id && item.rating !== 4) {
                    that.remove();
                }
            });
        });

        page.addClass('visible');
    }

    function renderSearchCarsPage(data) {

        var page = $('.search-car'),
        allCars = $('.search-car .search-large  > li');

        allCars.addClass('hidden');

        allCars.each(function () {

            var that = $(this);

            data.forEach(function (item) {
                if(that.data('index') == item.id){
                    that.removeClass('hidden');
                }
            });
        });

        page.addClass('visible');

    }



    function renderSingleCarPage(index, data) {

        var page = $('.single-car'),
            container = $('.preview-large');

        if (data.length) {
            data.forEach(function (item) {
                if (item.id == index) {

                    container.find('h3').text(item.name);
                    container.find('img').attr('src', item.image);
                    container.find('.manufacturer').text(item.manufacturer);
                    container.find('.year').text(item.year);
                    container.find('.mileage').text(item.mileage);
                    container.find('.fuel').text(item.fuel);
                    container.find('.capacity').text(item.capacity);
                    container.find('.transmission').text(item.transmission);
                    container.find('.price').text(item.priceDollar);
                    container.find('.priceBYN').text(function(){return Math.floor(item.priceDollar * 1.8732)});
                    container.find('.priceEUR').text(function(){return Math.floor(item.priceDollar * 0.9141)});

                }
            });
        }

        page.addClass('visible');

    }

    var checkboxes = $('.search-car input[type=checkbox]');

    checkboxes.click(function () {

        var that = $(this),
            specName = that.attr('name');

        if(that.is(":checked")) {

            if(!(filters[specName] && filters[specName].length)){
                filters[specName] = [];
            }

            filters[specName].push(that.val());

            createQueryHash(filters);

        }

        if(!that.is(":checked")) {

            if(filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)){

                var index = filters[specName].indexOf(that.val());

                filters[specName].splice(index, 1);

                if(!filters[specName].length){
                    delete filters[specName];
                }

            }

            createQueryHash(filters);
        }
    });

    $('.filters button').click(function (e) {
        e.preventDefault();
        window.location.hash = '#';
    });

    function renderFilterResults(filters, cars){

        var criteria = ['manufacturer'],
            results = [],
            isFiltered = false;

        checkboxes.prop('checked', false);


        criteria.forEach(function (c) {

            if(filters[c] && filters[c].length){

                if(isFiltered){
                    cars = results;
                    results = [];
                }

                filters[c].forEach(function (filter) {

                    cars.forEach(function (item){


                        if(typeof item.manufacturer[c] == 'number'){
                            if(item.manufacturer[c] == filter){
                                results.push(item);
                                isFiltered = true;
                            }
                        }

                        if(typeof item.manufacturer[c] == 'string'){
                            if(item.manufacturer[c].toLowerCase().indexOf(filter) != -1){
                                results.push(item);
                                isFiltered = true;
                            }
                        }

                    });

                    if(c && filter){
                        $('input[name='+c+'][value='+filter+']').prop('checked',true);
                    }
                });
            }

        });

        renderSearchCarsPage(results);
    }



    function renderErrorPage() {
        var page = $('.error');
        page.addClass('visible');
    }

    function createQueryHash(filters){

        if(!$.isEmptyObject(filters)){
            window.location.hash = '#filter/' + JSON.stringify(filters);
        }
        else{
            window.location.hash = '#';
        }

    }

});