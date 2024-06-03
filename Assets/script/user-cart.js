window.onload = function () {
  document.getElementById('loader').style.display = 'none';
}

// Показать продукты на странице корзины пользователя из localStorage
function showCartProducts() {
  let cartProducts = JSON.parse(localStorage.getItem("products")) || []; //Добавление всех продуктов из localStorage в массив
  let totalBill = 0; //Установить начальный счет на 0
  let totalQuantity = 0;

  /* Сортировка элементов корзины, чтобы порядок продуктов
     всегда был одинаковым, даже когда элементы
     редактируются / удаляются из корзины
  */
  if (cartProducts.length > 0) {
    cartProducts.sort((a, b) => a.product_id - b.product_id);

    document.querySelector(".user-cart-head").innerHTML =
      `<tr>
         <th scope="col" class="border-0">
            <div class="p-2 px-3 text-uppercase">Продукт</div>
         </th>
         <th scope="col" class="border-0 price">
            <div class="py-2 text-uppercase">Цена</div>
         </th>
         <th scope="col" class="border-0">
           <div class="py-2 text-uppercase">Количество</div>
         </th>
       </tr>`;

    // Установить значения массива в таблицу корзины пользователя
    document.querySelector(".user-cart-table").innerHTML = cartProducts.map(product => {
      // Преобразование строковых значений в числа
      let productPrice = parseFloat(product.product_price);
      let productQuantity = parseInt(product.product_quantity);
      let productTotalPrice = parseFloat(product.total_price);

      if (isNaN(productPrice) || isNaN(productQuantity) || isNaN(productTotalPrice)) {
        console.error(`Ошибка в данных продукта: ${JSON.stringify(product)}`);
        return ''; // Пропустить ошибочный продукт
      }

      totalBill += productTotalPrice; //Добавление цен всех продуктов в корзине
      totalQuantity += productQuantity; //Общее количество продуктов
      return `<tr>
                   <th scope="row" class="border-0">
                        <div class="p-2">
                            <img src="${product.product_image}" alt=""
                            width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                                <h5 class="mb-0"> <a href="product_detail.html?p_id=${product.product_id}"
                                class="text-dark d-inline-block align-middle">${product.product_name}
                                </a></h5><span class="text-muted font-weight-normal font-italic d-block">
                                Категория: ${product.category_name}</span>
                                <div class="price-sm"><strong>${productPrice} сом x ${productQuantity}</strong></div>
                            </div>
                        </div>
                    </th>
                    <td class="border-0 align-middle price"><strong>${productPrice} сом x ${productQuantity}</strong></td>
                    <td class="border-0 align-middle">
                        <div class="d-flex flex-lg-row">
                            <input type="button" class="sub-product edit-product" id="sub-${product.product_id}" value="-">
                            <input class="cart-edit product-quantity" type="text" name="quantity" id="quantity-${product.product_id}" value="${productQuantity}" disabled>
                            <input type="button" class="add-product edit-product" id="add-${product.product_id}" value="+">
                        </div>
                    </td>
                </tr>`;
    }).join('');

    // Показать подытог и общий счет в сводке заказа
    document.querySelector(".sub-total-bill").innerHTML = totalBill + " сом";
    document.querySelector(".total-bill").innerHTML = totalBill + " сом";

    // Показать подытог и общий счет в всплывающем окне оформления заказа
    document.querySelector(".checkout-quantity").innerHTML = totalQuantity;
    document.querySelector(".checkout-total-bill").innerHTML = totalBill + " сом";
    let discountBill = totalBill - ((totalBill * 10) / 100); // Расчет скидки
    document.querySelector(".checkout-discount-bill").innerHTML = discountBill + " сом";

    /********************* функциональность редактирования корзины ********************/
    let editProducts = document.querySelectorAll(".edit-product");

    for (let i = 0; i < editProducts.length; i++) {
      //Для идентификации слушателя событий и вызова функции updateCart
      editProducts[i].addEventListener('click', updateCart, false);
    }
  } else {
    // Удаление сводки заказа и личных данных, если в корзине нет товаров
    document.querySelector(".order-details").style.display = "none";

    // Показать сообщение о пустой корзине с опцией возврата
    document.querySelector(".user-cart-table").innerHTML =
      `<div class="col-lg-12 d-flex justify-content-center">
          <div>
            <h5 class="my-2">Ваша корзина пуста.</h5>
            <div class="d-flex justify-content-center">
                <a href="../index.html#shop-by-category" class="btn d-inline-block align-middle mt-2">ВЕРНУТЬСЯ В МАГАЗИН</a>     
            </div>
          </div>
       </div>`;
  }

  // Отображение общего количества товаров на значке корзины
  document.querySelector(".total-quantity").innerHTML = `<span>${totalQuantity}</span>`;
}

/**
 * Обновление количества и цены продукта
 * и также обновление в localStorage
**/
function updateCart() {
  // Получить все текущие продукты из localStorage
  let cartCurrentProducts = JSON.parse(localStorage.getItem("products"));

  let buttonType = this.id.slice(0, 3); //Получить первую строковую часть ID кнопки
  let id = this.id.slice(4); //Получить числовую часть ID кнопки
  let totalPrice = 0;

  cartCurrentProducts.forEach((product, index) => {
    let productQuantity = document.querySelector(`#quantity-${id}`);
    let quantity = parseInt(productQuantity.value);

    if (product.product_id == id) {
      if (buttonType === "add") { //Кнопка для добавления продуктов
        quantity++;
        productQuantity.value = quantity;
      } else if (buttonType === "sub") { //Кнопка для уменьшения количества продуктов
        if (quantity > 1) {
          quantity--;
          productQuantity.value = quantity;
        } else {
          quantity--;

          // Удалить объект из элементов корзины, когда количество равно 0
          cartCurrentProducts.splice(index, 1);

          // Сохранить обновленные продукты в localStorage
          localStorage.setItem('products', JSON.stringify(cartCurrentProducts));

          // Отразить изменения продуктов корзины на странице корзины
          showCartProducts();

          if (cartCurrentProducts.length == 0) {
            document.querySelector(".user-cart-head").style.display = "none";
          }
        }
      }

      // Обновить localStorage, если количество >=1
      if (quantity >= 1) {
        // Рассчитать общую цену
        totalPrice = quantity * parseFloat(product.product_price);

        let cartItems = []; // Массив выбранных пользователем продуктов

        let productJson = {
          product_id: product.product_id,
          category_name: product.category_name,
          product_name: product.product_name,
          product_description: product.product_description,
          product_image: product.product_image,
          product_quantity: quantity,
          product_price: parseFloat(product.product_price),
          total_price: totalPrice
        };

        // Получить все текущие продукты из корзины 
        let previousProducts = JSON.parse(localStorage.getItem("products"));

        previousProducts.forEach(preProduct => {
          if (preProduct.product_id !== productJson.product_id) {
            cartItems.push(preProduct);
          }
        });

        cartItems.push(productJson);

        // Сохранение деталей продукта в localStorage с общей ценой и количеством
        localStorage.setItem("products", JSON.stringify(cartItems));

        // Отразить изменения продуктов корзины на странице корзины
        showCartProducts();
      }
    }
  });
}

/******************* Функциональность оформления заказа ******************/

// Кнопка размещения заказа
let clearLS = document.getElementById("done-btn");

// Поля времени доставки и УСП
let checkoutbtn = document.getElementById("checkoutbtn");
let checkouttime = document.getElementById("checkout-time");
let deliverytime = document.getElementById("delivery-time");

// Удаление продуктов из localStorage при подтверждении заказа
clearLS.addEventListener('click', function () {
  // Получить все поля личной информации
  const personalInfoFields = document.querySelectorAll(".personal-info-input");
  let isPersonalInfoFilled = true;

  // Проверка заполненности всех полей доставки
	for (let i = 0; i < personalInfoFields.length; i++) {
    if (personalInfoFields[i].value == "") {
      isPersonalInfoFilled = false; // Если хоть одно поле пустое
    }
  }

  // Удалить продукты из localStorage, если все поля заполнены
  if (isPersonalInfoFilled) {
    localStorage.removeItem("products");
  }
});

// Показать модальное окно с деталями заказа и УСП
checkoutbtn.addEventListener('click', () => {
  // Получить все поля личной информации
  const personalInfoFields = document.querySelectorAll(".personal-info-input");
  let isPersonalInfoFilled = true;

  for (let i = 0; i < personalInfoFields.length; i++) {
    // Если какое-либо поле пустое, показать сообщение об ошибке в модальном окне
    if (personalInfoFields[i].value == "") {
      document.querySelector(".cart-modal-title").innerHTML = "Пожалуйста, заполните информацию о доставке перед оформлением заказа!";
      isPersonalInfoFilled = false; // Если хоть одно поле пустое
    }
  }

  // Подтверждающее сообщение, если все поля заполнены
  if (isPersonalInfoFilled) {
    document.querySelector(".cart-modal-title").innerHTML = "Ваш заказ почти готов к размещению!";
  }

  let today = new Date();

  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let date = today.getDate();

  let currentDate = `${date}/${month}/${year}`; // Текущая дата
  let tomorrowDate = `${date + 1}/${month}/${year}`; // Завтрашняя дата

  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();

  let currentTime = `${hours}:${minutes}:${seconds}`; // Текущее время

  checkouttime.innerText = currentDate + ' ' + currentTime;
  deliverytime.innerText = tomorrowDate + ' ' + currentTime;
});

// Валидация формы
(function () {
  'use strict';
  window.addEventListener('load', function () {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function (form) {
      checkoutbtn.addEventListener('click', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

/******************** Вызовы функций *******************/

// Показать количество продуктов на значке корзины
showCartProducts();