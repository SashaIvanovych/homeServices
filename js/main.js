// ========================================================= Меню-бургер =================================
let bodyLockStatus = true;

let bodyLock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        }
        body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        document.documentElement.classList.add("lock");

        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

let bodyLockToggle = (delay = 500) => {
    if (document.documentElement.classList.contains('lock')) {
        bodyUnlock(delay);
    } else {
        bodyLock(delay);
    }
}

let bodyUnlock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
        }, delay);
        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

function menuInit() {
    if (document.querySelector(".icon-menu")) {
        document.addEventListener("click", function (e) {
            if (bodyLockStatus && e.target.closest('.icon-menu')) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        });

        // Додаємо обробник для пунктів меню
        const menuLinks = document.querySelectorAll(".menu__link");
        if (menuLinks.length) {
            menuLinks.forEach(link => {
                link.addEventListener("click", () => {
                    menuClose(); // Закриваємо меню при натисканні на пункт
                });
            });
        }
    }
}

function menuOpen() {
    bodyLock();
    document.documentElement.classList.add("menu-open");
}

function menuClose() {
    bodyUnlock();
    document.documentElement.classList.remove("menu-open");
}

menuInit();

// ==================================================================== Dinamic Adaptive =======================================================

class DynamicAdapt {
    constructor(type) {
        this.type = type
    }
    init() {
        // масив об'єктів
        this.оbjects = []
        this.daClassname = '_dynamic_adapt_'
        // масив DOM-елементів
        this.nodes = [...document.querySelectorAll('[data-da]')]

        // наповнення оbjects об'єктами
        this.nodes.forEach((node) => {
            const data = node.dataset.da.trim()
            const dataArray = data.split(',')
            const оbject = {}
            оbject.element = node
            оbject.parent = node.parentNode
            оbject.destination = document.querySelector(`${dataArray[0].trim()}`)
            оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : '767'
            оbject.place = dataArray[2] ? dataArray[2].trim() : 'last'
            оbject.index = this.indexInParent(оbject.parent, оbject.element)
            this.оbjects.push(оbject)
        })

        this.arraySort(this.оbjects)

        // масив унікальних медіа-запитів
        this.mediaQueries = this.оbjects
            .map(({ breakpoint }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
            .filter((item, index, self) => self.indexOf(item) === index)

        // навішування слухача на медіа-запит
        // та виклик оброблювача при першому запуску
        this.mediaQueries.forEach((media) => {
            const mediaSplit = media.split(',')
            const matchMedia = window.matchMedia(mediaSplit[0])
            const mediaBreakpoint = mediaSplit[1]

            // масив об'єктів з відповідним брейкпоінтом
            const оbjectsFilter = this.оbjects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint)
            matchMedia.addEventListener('change', () => {
                this.mediaHandler(matchMedia, оbjectsFilter)
            })
            this.mediaHandler(matchMedia, оbjectsFilter)
        })
    }
    // Основна функція
    mediaHandler(matchMedia, оbjects) {
        if (matchMedia.matches) {
            оbjects.forEach((оbject) => {
                // оbject.index = this.indexInParent(оbject.parent, оbject.element);
                this.moveTo(оbject.place, оbject.element, оbject.destination)
            })
        } else {
            оbjects.forEach(({ parent, element, index }) => {
                if (element.classList.contains(this.daClassname)) {
                    this.moveBack(parent, element, index)
                }
            })
        }
    }
    // Функція переміщення
    moveTo(place, element, destination) {
        element.classList.add(this.daClassname)
        if (place === 'last' || place >= destination.children.length) {
            destination.append(element)
            return
        }
        if (place === 'first') {
            destination.prepend(element)
            return
        }
        destination.children[place].before(element)
    }
    // Функція повернення
    moveBack(parent, element, index) {
        element.classList.remove(this.daClassname)
        if (parent.children[index] !== undefined) {
            parent.children[index].before(element)
        } else {
            parent.append(element)
        }
    }
    // Функція отримання індексу всередині батьківського єлементу
    indexInParent(parent, element) {
        return [...parent.children].indexOf(element)
    }
    // Функція сортування масиву по breakpoint та place
    // за зростанням для this.type = min
    // за спаданням для this.type = max
    arraySort(arr) {
        if (this.type === 'min') {
            arr.sort((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) {
                        return 0
                    }
                    if (a.place === 'first' || b.place === 'last') {
                        return -1
                    }
                    if (a.place === 'last' || b.place === 'first') {
                        return 1
                    }
                    return 0
                }
                return a.breakpoint - b.breakpoint
            })
        } else {
            arr.sort((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) {
                        return 0
                    }
                    if (a.place === 'first' || b.place === 'last') {
                        return 1
                    }
                    if (a.place === 'last' || b.place === 'first') {
                        return -1
                    }
                    return 0
                }
                return b.breakpoint - a.breakpoint
            })
            return
        }
    }
}
const da = new DynamicAdapt("max");
da.init();

// ================================================================== Slider ===================================================

//Ініціалізація слайдерів
function initSliders() {
    // Список слайдерів
    // Перевіряємо, чи є слайдер на сторінці
    if (document.querySelector('.reviews__slider')) { // Вказуємо склас потрібного слайдера
        // Створюємо слайдер
        new Swiper('.reviews__slider', { // Вказуємо склас потрібного слайдера
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: true,
            speed: 800,
            // centeredSlides: true,

            //touchRatio: 0,
            // simulateTouch: true,
            // loop: true,
            //preloadImages: false,
            //lazy: true,


            // // Ефекти
            // effect: 'fade',
            // autoplay: {
            // 	delay: 3000,
            // 	disableOnInteraction: false,
            // },


            // Пагінація

            pagination: {
                el: '.reviews__pagination',
                clickable: true,
            },

            // Скроллбар

            // scrollbar: {
            //     el: '.swiper-scrollbar',
            //     draggable: true,
            // },


            // Кнопки "вліво/вправо"
            navigation: {
                prevEl: '.reviews__arrow--left',
                nextEl: '.reviews__arrow--right',
            },

            // breakpoints: {

            // },

            // Події
            // on: {
            // }
        });
    }
}

window.addEventListener("load", function (e) {
    // Запуск ініціалізації слайдерів
    initSliders();
    // Запуск ініціалізації скролла на базі слайдера (за класом swiper_scroll)
    //initSlidersScroll();
});

// ==================================================================== Spollers =======================================================
/**
 * Spollers (Accordions) Configuration Attributes:
 * 
 * 1. [data-spollers]
 *    - Purpose: Marks an element as a spoller container.
 *    - Value: Optional. Can include media queries in the format "[min-width],[max-width]".
 *    - Example: <div data-spollers></div>
 *              <div data-spollers="768,max"></div>
 * 
 * 2. [data-spoller]
 *    - Purpose: Added to the clickable title of the spoller.
 *    - Value: No value required.
 *    - Example: <div data-spoller>Spoller Title</div>
 * 
 * 3. [data-one-spoller]
 *    - Purpose: Enables "accordion" mode, where only one spoller within the container can be open at a time.
 *    - Value: No value required.
 *    - Example: <div data-spollers data-one-spoller></div>
 * 
 * 4. [data-spollers-speed]
 *    - Purpose: Sets the speed of the slide down/up animation for spoller content.
 *    - Value: Number representing the duration in milliseconds.
 *    - Example: <div data-spollers data-spollers-speed="700"></div>
 * 
 * 5. [data-spoller-close]
 *    - Purpose: Automatically closes the spoller when clicking outside of it.
 *    - Value: No value required.
 *    - Example: <div data-spoller-close>Spoller Title</div>
 * 
 * 6. [data-showmore]
 *    - Purpose: (Optional) Partially reveals spoller content and controls the slide-up/slide-down effect.
 *    - Value: Number representing the height in pixels to show by default.
 *    - Example: <div data-spoller data-showmore="100">Spoller Title</div>
 * 
 * Example Usage:
 * 
 * // Regular spollers with no media queries
 * <div data-spollers data-one-spoller data-spollers-speed="600">
 *     <div data-spoller>Spoller Title 1</div>
 *     <div>Spoller Content 1</div>
 *     <div data-spoller>Spoller Title 2</div>
 *     <div>Spoller Content 2</div>
 * </div>
 * 
 * // Spollers with media queries
 * <div data-spollers="768,max" data-one-spoller>
 *     <div data-spoller>Spoller Title 1</div>
 *     <div>Spoller Content 1</div>
 * </div>
 */

function spollers() {
    const spollersArray = document.querySelectorAll('[data-spollers]');
    if (spollersArray.length > 0) {
        // Отримання звичайних слойлерів
        const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
            return !item.dataset.spollers.split(",")[0];
        });
        // Ініціалізація звичайних слойлерів
        if (spollersRegular.length) {
            initSpollers(spollersRegular);
        }
        // Отримання слойлерів з медіа-запитами
        let mdQueriesArray = dataMediaQueries(spollersArray, "spollers");
        if (mdQueriesArray && mdQueriesArray.length) {
            mdQueriesArray.forEach(mdQueriesItem => {
                // Подія
                mdQueriesItem.matchMedia.addEventListener("change", function () {
                    initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
                });
                initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
            });
        }
        // Ініціалізація
        function initSpollers(spollersArray, matchMedia = false) {
            spollersArray.forEach(spollersBlock => {
                spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
                if (matchMedia.matches || !matchMedia) {
                    spollersBlock.classList.add('_spoller-init');
                    initSpollerBody(spollersBlock);
                    spollersBlock.addEventListener("click", setSpollerAction);
                } else {
                    spollersBlock.classList.remove('_spoller-init');
                    initSpollerBody(spollersBlock, false);
                    spollersBlock.removeEventListener("click", setSpollerAction);
                }
            });
        }
        // Робота з контентом
        function initSpollerBody(spollersBlock, hideSpollerBody = true) {
            let spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
            if (spollerTitles.length) {
                spollerTitles = Array.from(spollerTitles).filter(item => item.closest('[data-spollers]') === spollersBlock);
                spollerTitles.forEach(spollerTitle => {
                    if (hideSpollerBody) {
                        spollerTitle.removeAttribute('tabindex');
                        if (!spollerTitle.classList.contains('_spoller-active')) {
                            spollerTitle.nextElementSibling.hidden = true;
                        }
                    } else {
                        spollerTitle.setAttribute('tabindex', '-1');
                        spollerTitle.nextElementSibling.hidden = false;
                    }
                });
            }
        }
        function setSpollerAction(e) {
            const el = e.target;
            if (el.closest('[data-spoller]')) {
                const spollerTitle = el.closest('[data-spoller]');
                const spollersBlock = spollerTitle.closest('[data-spollers]');
                const oneSpoller = spollersBlock.hasAttribute('data-one-spoller');
                const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
                if (!spollersBlock.querySelectorAll('._slide').length) {
                    if (oneSpoller && !spollerTitle.classList.contains('_spoller-active')) {
                        hideSpollersBody(spollersBlock);
                    }
                    spollerTitle.classList.toggle('_spoller-active');
                    _slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
                }
                e.preventDefault();
            }
        }
        function hideSpollersBody(spollersBlock) {
            const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._spoller-active');
            const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
            if (spollerActiveTitle && !spollersBlock.querySelectorAll('._slide').length) {
                spollerActiveTitle.classList.remove('_spoller-active');
                _slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
            }
        }
        // Закриття при кліку поза спойлером
        const spollersClose = document.querySelectorAll('[data-spoller-close]');
        if (spollersClose.length) {
            document.addEventListener("click", function (e) {
                const el = e.target;
                if (!el.closest('[data-spollers]')) {
                    spollersClose.forEach(spollerClose => {
                        const spollersBlock = spollerClose.closest('[data-spollers]');
                        if (spollersBlock.classList.contains('_spoller-init')) {
                            const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
                            spollerClose.classList.remove('_spoller-active');
                            _slideUp(spollerClose.nextElementSibling, spollerSpeed);
                        }
                    });
                }
            });
        }
    }
}

// Унікалізація масиву
function uniqArray(array) {
    return array.filter(function (item, index, self) {
        return self.indexOf(item) === index;
    });
}

// Обробка медіа запитів з атрибутів
function dataMediaQueries(array, dataSetValue) {
    // Отримання об'єктів з медіа-запитами
    const media = Array.from(array).filter(function (item, index, self) {
        if (item.dataset[dataSetValue]) {
            return item.dataset[dataSetValue].split(",")[0];
        }
    });
    // Ініціалізація об'єктів з медіа-запитами
    if (media.length) {
        const breakpointsArray = [];
        media.forEach(item => {
            const params = item.dataset[dataSetValue];
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint);
        });
        // Отримуємо унікальні брейкпоінти
        let mdQueries = breakpointsArray.map(function (item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
        });
        mdQueries = uniqArray(mdQueries);
        const mdQueriesArray = [];

        if (mdQueries.length) {
            // Працюємо з кожним брейкпоінтом
            mdQueries.forEach(breakpoint => {
                const paramsArray = breakpoint.split(",");
                const mediaBreakpoint = paramsArray[1];
                const mediaType = paramsArray[2];
                const matchMedia = window.matchMedia(paramsArray[0]);
                // Об'єкти з потрібними умовами
                const itemsArray = breakpointsArray.filter(function (item) {
                    if (item.value === mediaBreakpoint && item.type === mediaType) {
                        return true;
                    }
                });
                mdQueriesArray.push({
                    itemsArray,
                    matchMedia
                })
            });
            return mdQueriesArray;
        }
    }
}

// Допоміжні модулі плавного розкриття та закриття об'єкта ======================================================================================================================================================================
let _slideUp = (target, duration = 500, showmore = 0) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = `${target.offsetHeight}px`;
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = showmore ? `${showmore}px` : `0px`;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(() => {
            target.hidden = !showmore ? true : false;
            !showmore ? target.style.removeProperty('height') : null;
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            !showmore ? target.style.removeProperty('overflow') : null;
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
            // Створюємо подію 
            document.dispatchEvent(new CustomEvent("slideUpDone", {
                detail: {
                    target: target
                }
            }));
        }, duration);
    }
}

let _slideToggle = (target, duration = 500) => {
    if (target.hidden) {
        return _slideDown(target, duration);
    } else {
        return _slideUp(target, duration);
    }
}

let _slideDown = (target, duration = 500, showmore = 0) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        target.hidden = target.hidden ? false : null;
        showmore ? target.style.removeProperty('height') : null;
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = showmore ? `${showmore}px` : `0px`;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.transitionProperty = "height, margin, padding";
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
            // Створюємо подію
            document.dispatchEvent(new CustomEvent("slideDownDone", {
                detail: {
                    target: target
                }
            }));
        }, duration);
    }
}

spollers();

// ==================================================================== Form validate =======================================================
let formValidate = {
    getErrors(form) {
        let error = 0;
        let formRequiredItems = form.querySelectorAll('*[data-required]');
        if (formRequiredItems.length) {
            formRequiredItems.forEach(formRequiredItem => {
                if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
                    error += this.validateInput(formRequiredItem);
                }
            });
        }
        return error;
    },
    validateInput(formRequiredItem) {
        let error = 0;
        if (formRequiredItem.dataset.required === "email") {
            formRequiredItem.value = formRequiredItem.value.replace(" ", "");
            if (this.emailTest(formRequiredItem)) {
                this.addError(formRequiredItem);
                error++;
            } else {
                this.removeError(formRequiredItem);
            }
        } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
            this.addError(formRequiredItem);
            error++;
        } else {
            if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else {
                this.removeError(formRequiredItem);
            }
        }
        return error;
    },
    addError(formRequiredItem) {
        formRequiredItem.classList.add('_form-error');
        formRequiredItem.parentElement.classList.add('_form-error');
        let inputError = formRequiredItem.parentElement.querySelector('.form__error');
        if (inputError) formRequiredItem.parentElement.removeChild(inputError);
        if (formRequiredItem.dataset.error) {
            formRequiredItem.parentElement.insertAdjacentHTML('beforeend', `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        }
    },
    removeError(formRequiredItem) {
        formRequiredItem.classList.remove('_form-error');
        formRequiredItem.parentElement.classList.remove('_form-error');
        if (formRequiredItem.parentElement.querySelector('.form__error')) {
            formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'));
        }
    },
    formClean(form) {
        form.reset();
        setTimeout(() => {
            let inputs = form.querySelectorAll('input,textarea');
            for (let index = 0; index < inputs.length; index++) {
                const el = inputs[index];
                el.parentElement.classList.remove('_form-focus');
                el.classList.remove('_form-focus');
                formValidate.removeError(el);
            }
            let checkboxes = form.querySelectorAll('.checkbox__input');
            if (checkboxes.length > 0) {
                for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
            }
            if (flsModules.select) {
                let selects = form.querySelectorAll('.select');
                if (selects.length) {
                    for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector('select');
                        flsModules.select.selectBuild(select);
                    }
                }
            }
        }, 0);
    },
    emailTest(formRequiredItem) {
        return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
    }
}

function formFieldsInit(options = { viewPass: false, autoHeight: false }) {
    document.body.addEventListener("focusin", function (e) {
        const targetElement = e.target;
        if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.add('_form-focus');
                targetElement.parentElement.classList.add('_form-focus');
            }
            targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null;
        }
    });
    document.body.addEventListener("focusout", function (e) {
        const targetElement = e.target;
        if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.remove('_form-focus');
                targetElement.parentElement.classList.remove('_form-focus');
            }
            // Миттєва валідація
            targetElement.hasAttribute('data-validate') ? formValidate.validateInput(targetElement) : null;
        }
    });
    // Якщо увімкнено, додаємо функціонал "Показати пароль"
    if (options.viewPass) {
        document.addEventListener("click", function (e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains('_viewpass-active') ? "password" : "text";
                targetElement.parentElement.querySelector('input').setAttribute("type", inputType);
                targetElement.classList.toggle('_viewpass-active');
            }
        });
    }
    // Якщо увімкнено, додаємо функціонал "Автовисота"
    if (options.autoHeight) {
        const textareas = document.querySelectorAll('textarea[data-autoheight]');
        if (textareas.length) {
            textareas.forEach(textarea => {
                const startHeight = textarea.hasAttribute('data-autoheight-min') ?
                    Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                const maxHeight = textarea.hasAttribute('data-autoheight-max') ?
                    Number(textarea.dataset.autoheightMax) : Infinity;
                setHeight(textarea, Math.min(startHeight, maxHeight))
                textarea.addEventListener('input', () => {
                    if (textarea.scrollHeight > startHeight) {
                        textarea.style.height = `auto`;
                        setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                    }
                });
            });
            function setHeight(textarea, height) {
                textarea.style.height = `${height}px`;
            }
        }
    }
}
// Валідація форм

/* Відправлення форм */
function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
        for (const form of forms) {
            form.addEventListener('submit', function (e) {
                const form = e.target;
                formSubmitAction(form, e);
            });
            form.addEventListener('reset', function (e) {
                const form = e.target;
                formValidate.formClean(form);
            });
        }
    }
    async function formSubmitAction(form, e) {
        const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0;
        if (error === 0) {
            const ajax = form.hasAttribute('data-ajax');
            if (ajax) { // Якщо режим ajax
                e.preventDefault();
                const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
                const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
                const formData = new FormData(form);

                form.classList.add('_sending');
                const response = await fetch(formAction, {
                    method: formMethod,
                    body: formData
                });
                if (response.ok) {
                    let responseResult = await response.json();
                    form.classList.remove('_sending');
                    formSent(form, responseResult);
                } else {
                    alert("Помилка");
                    form.classList.remove('_sending');
                }
            } else if (form.hasAttribute('data-dev')) {	// Якщо режим розробки
                e.preventDefault();
                formSent(form);
            }
        } else {
            e.preventDefault();
            if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
                const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error';
                gotoBlock(formGoToErrorClass, true, 1000);
            }
        }
    }
    // Дії після надсилання форми
    function formSent(form, responseResult = ``) {
        // Створюємо подію відправлення форми
        document.dispatchEvent(new CustomEvent("formSent", {
            detail: {
                form: form
            }
        }));
        // Показуємо попап, якщо підключено модуль попапів 
        // та для форми вказано налаштування
        setTimeout(() => {
            if (flsModules.popup) {
                const popup = form.dataset.popupMessage;
                popup ? flsModules.popup.open(popup) : null;
            }
        }, 0);
        // Очищуємо форму
        formValidate.formClean(form);
        // Повідомляємо до консолі
        formLogging(`Форму відправлено!`);
    }
    function formLogging(message) {
        FLS(`[Форми]: ${message}`);
    }
}

// FLS (Full Logging System)
function FLS(message) {
    setTimeout(() => {
        console.log(message);
    }, 0);
}


formFieldsInit({
    viewPass: false,
    autoHeight: false
});

formSubmit();

// ==================================================================== Smooth scroll =======================================================
var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 300,
    header: ".header"
});

// ==================================================================== Watcher =======================================================
// Спостерігач об'єктів [всевидюче око]
// data-watch - можна писати значення для застосування кастомного коду
// data-watch-root - батьківський елемент всередині якого спостерігати за об'єктом
// data-watch-margin -відступ
// data-watch-threshold - відсоток показу об'єкта для спрацьовування
// data-watch-once - спостерігати лише один раз
// _watcher-view - клас який додається за появи об'єкта
function uniqArray(array) {
    return array.filter(function (item, index, self) {
        return self.indexOf(item) === index;
    });
}

class ScrollWatcher {
    constructor(props) {
        let defaultConfig = {
            logging: true,
        };
        this.config = Object.assign(defaultConfig, props);
        this.observer;

        // Перевірка, чи є вже клас 'watcher' на кореневому елементі
        if (!document.documentElement.classList.contains('watcher')) {
            this.scrollWatcherRun();
        }
    }

    // Оновлення конструктора
    scrollWatcherUpdate() {
        this.scrollWatcherRun();
    }

    // Запуск конструктора
    scrollWatcherRun() {
        document.documentElement.classList.add('watcher');
        this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
    }

    // Конструктор спостерігачів
    scrollWatcherConstructor(items) {
        if (items.length) {
            this.scrollWatcherLogging(`Прокинувся, стежу за об'єктами (${items.length})...`);
            let uniqParams = uniqArray(Array.from(items).map(item => `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`));

            uniqParams.forEach(uniqParam => {
                let uniqParamArray = uniqParam.split('|');
                let paramsWatch = {
                    root: uniqParamArray[0],
                    margin: uniqParamArray[1],
                    threshold: uniqParamArray[2]
                };

                let groupItems = Array.from(items).filter(item => {
                    let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                    let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
                    let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                    return (
                        String(watchRoot) === paramsWatch.root &&
                        String(watchMargin) === paramsWatch.margin &&
                        String(watchThreshold) === paramsWatch.threshold
                    );
                });

                let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                this.scrollWatcherInit(groupItems, configWatcher);
            });
        } else {
            this.scrollWatcherLogging("Сплю, немає об'єктів для стеження. ZzzZZzz");
        }
    }

    // Функція створення налаштувань
    getScrollWatcherConfig(paramsWatch) {
        let configWatcher = {};
        if (document.querySelector(paramsWatch.root)) {
            configWatcher.root = document.querySelector(paramsWatch.root);
        } else if (paramsWatch.root !== 'null') {
            this.scrollWatcherLogging(`Емм... батьківського об'єкта ${paramsWatch.root} немає на сторінці`);
        }

        configWatcher.rootMargin = paramsWatch.margin;
        if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
            this.scrollWatcherLogging(`Йой, налаштування data-watch-margin потрібно задавати в PX або %`);
            return;
        }

        if (paramsWatch.threshold === 'prx') {
            paramsWatch.threshold = [];
            for (let i = 0; i <= 1.0; i += 0.005) {
                paramsWatch.threshold.push(i);
            }
        } else {
            paramsWatch.threshold = paramsWatch.threshold.split(',');
        }
        configWatcher.threshold = paramsWatch.threshold;

        return configWatcher;
    }

    // Функція створення нового спостерігача зі своїми налаштуваннями
    scrollWatcherCreate(configWatcher) {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                this.scrollWatcherCallback(entry, observer);
            });
        }, configWatcher);
    }

    // Функція ініціалізації спостерігача зі своїми налаштуваннями
    scrollWatcherInit(items, configWatcher) {
        this.scrollWatcherCreate(configWatcher);
        items.forEach(item => this.observer.observe(item));
    }

    // Функція обробки базових дій точок спрацьовування
    scrollWatcherIntersecting(entry, targetElement) {
        if (entry.isIntersecting) {
            !targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
            this.scrollWatcherLogging(`Я бачу ${targetElement.classList}, додав клас _watcher-view`);
        } else {
            targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
            this.scrollWatcherLogging(`Я не бачу ${targetElement.classList}, прибрав клас _watcher-view`);
        }
    }

    // Функція вимкнення стеження за об'єктом
    scrollWatcherOff(targetElement, observer) {
        observer.unobserve(targetElement);
        this.scrollWatcherLogging(`Я перестав стежити за ${targetElement.classList}`);
    }

    // Функція виведення в консоль
    scrollWatcherLogging(message) {
        this.config.logging ? console.log(`[Спостерігач]: ${message}`) : null;
    }

    // Функція обробки спостереження
    scrollWatcherCallback(entry, observer) {
        const targetElement = entry.target;
        this.scrollWatcherIntersecting(entry, targetElement);

        if (targetElement.hasAttribute('data-watch-once') && entry.isIntersecting) {
            this.scrollWatcherOff(targetElement, observer);
        }

        document.dispatchEvent(new CustomEvent("watcherCallback", {
            detail: {
                entry: entry
            }
        }));
    }
}

new ScrollWatcher({});
