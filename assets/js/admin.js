$(function () {



    var createCarPage = $('.create-car, .single-car');

    createCarPage.on('click', function (e) {

        if (createCarPage.hasClass('visible')) {

            var clicked = $(e.target);

            if (clicked.hasClass('close') || clicked.hasClass('overlay')
                || clicked.hasClass('cancel') || clicked.hasClass('submit')) {
                createQueryHash();
            }

        }

    });

    var carsIds,
        prefix = "car_id_",
        carsIds_key = "car_ids";

    $.getJSON("cars.json", function (data) {
        carsIds = $.map(data, function (car) {
            var stringified = JSON.stringify(car);
            localStorage.setItem(prefix + car.id, stringified);
            return car.id;
        });

        localStorage.setItem(carsIds_key, JSON.stringify(carsIds));
        
        cars = data;
        generateTableCarsHTML(cars);

        $(window).trigger('hashchange');
    });

    $(window).on('hashchange', function () {
        render(decodeURI(window.location.hash));
    });


    function generateTableCarsHTML(data) {

        var create = $('.tzine');

        var edit = $('html');

        var remove = $('body');

        var source = $("#table-template").html();

        var template = Handlebars.compile(source);
        $('body').append(template(data));

        create.find('a').on('click', function (e) {
            e.preventDefault();
            window.location.hash = 'create'
        });

        edit.find('.edit').on('click', function (e) {
            e.preventDefault();

            var carIndex = $(this).data('index');

            window.location.hash = 'edit/' + carIndex;
        });

        remove.find('.remove').on("click", function (e) {
            e.preventDefault();
            var $this = $(e.target);

            $this.parents("tr").slideUp("slow", function () {
                $(this).remove();
            });
            var carIndex = $(this).data('index');
            localStorage.removeItem(prefix + carIndex);
            var index = carsIds.indexOf(carIndex);
            carsIds.splice(index, 1);
            localStorage.setItem(carsIds_key, carsIds);

        });
    }


    $(".submit").on("click", function (e) {
        e.preventDefault();


        var name = $("#series"),
            manufacturer = $('#mark'),
            priceDollar = $('#price'),
            year = $('#year'),
            mileage = $('#mileage'),
            fuel = $('input[name=radio-1]:checked'),
            capacity = $('#capacity'),
            transmission = $('input[name=radio-2]:checked'),
            rating = $('#rating'),
            image = $('#image');

        var car = {
            id: carsIds[carsIds.length - 1] + 1,
            name: name.val(),
            manufacturer: manufacturer.val(),
            priceDollar: priceDollar.val(),
            year: year.val(),
            mileage: mileage.val(),
            fuel: fuel.val(),
            capacity: capacity.val(),
            transmission: transmission.val(),
            rating: rating.val(),
            image: image.val()
        };

        carsIds.push(car.id);
        localStorage.setItem(carsIds_key, JSON.stringify(carsIds));
        localStorage.setItem(prefix + car.id, JSON.stringify(car));

        generateTableCarsHTML([car]);
        name.add(manufacturer).add(priceDollar).add(year).add(mileage)
            .add(capacity).add(transmission).add(rating).add(image).val("");
    });



    function render(url) {

        var temp = url.split('/')[0];
        $('.main-content-table .page').removeClass('visible');


        var map = {


            '#create': function () {
                url.split('#create');
                renderCreateCarPage();
            },

            '#edit': function () {
                var index = url.split('#edit/')[1].trim();
                renderEditCarPage(index, cars);
            }


        };

        if (map[temp]) {
            map[temp]();
        }

        else {
            renderErrorPage();
        }

    }


    function renderCreateCarPage() {

        var page = $('.create-car');

        page.addClass('visible');

    }

    function renderEditCarPage(index, data) {

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

    function renderErrorPage() {
        var page = $('.error');
        page.addClass('visible');
    }

    function createQueryHash() {
        window.location.hash = '#';
    }

    $("#rez_tablh input").on("keyup", function(){
        var filterN = $("#thnaim input").val();

        $(".features-table tr").each(function () {
            var n = $(this).find('.naim').text();
            if (n.search(new RegExp(filterN,"i")) < 0) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    });
});