
window.onload = function () {
  document.getElementById('loader').style.display = 'none';
}


let getUrlParamsProductId = function (url) {
  let params = {};
  (url + "?")
    .split("?")[1]
    .split("&")
    .forEach(function (pair) {
      pair = (pair + "=").split("=").map(decodeURIComponent);
      if (pair[0].length) {
        params[pair[0]] = pair[1];
      }
    });

  return params;
};


async function getProductDetails() {
  let products = true;


  let params = getUrlParamsProductId(window.location.href);
  let pid = params.p_id;


  const response = await fetch("../assets/JSON/decent-parts.json");


  const categories = await response.json();

  categories.forEach((category) => {

    let sub_categories = category.autoSubPart;
    sub_categories.forEach((sub_cat) => {

      let product_categories = sub_cat.products;
      let similar_products = [];

      product_categories.forEach((product_detail) => {
        if (product_detail.p_id == pid) {
          products = sub_cat.products;

          document.querySelector(".products-container").innerHTML = products
            .map((product) => {
              if (product.p_id == pid) {
                if (product.stock_amount == 0) {
                  product.stock_amount = "Out Of Stock";
                } else {
                  product.stock_amount = "In Stock";
                }

                return `
              <div class = "container">
              <div class="row">
              <div class="col-md-6">
                <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src=${product.url1} class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item">
                            <img src=${product.url2} class="d-block w-100"
                                alt="...">
                        </div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Предыдущий</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Следующий</span>
                    </a>
                </div>
            </div>

            <div class="col-md-6 product-det">
                <p><p><b> <a href="../index.html">Home</a> / <a href="../index.html#${category.id}"> ${category.autoPart}</a> / <a href="product.html?id=${category.id}&c_id=${sub_cat.c_id}"> ${sub_cat.name} </a> / ${product_detail.name} </b></p>
                <hr></p>
                <h1>${product.name}</h1>
                <h4 class="product-price">${product.price} сом</h4>
                <p><b>Доступность:</b> <span class="badge badge-pill badge-primary">${product.stock_amount}</span></p>

                <div>
                    <label style="color:white">Количество:</label>
                    <button class="sub-product">-</button>
                    <input type="text" name="quantity" value="1" class="cart-edit product-quantity" disabled>
                    <button class="add-product">+</button>
                    <button type="button" class="btn btn-default cart add-to-cart">Добавить</button>
                </div>
                <hr>
            </div>
            </div>
        </div>
        <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <h3 class="title">Характеристики продукта</h3>
                <hr>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <p>${product.description}.</p>
            </div>
        </div>
    </div> `;
              }
              else {
                similar_products.push(product);


                document.querySelector(".similar-products").innerHTML = similar_products.map((similarProduct, index) => {
                  if (index < 3) {
                    return `<div class="col-md-4 text-center">
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><img src="${similarProduct.url1}" height="300" ></a>
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><h6 class="mt-2 similar-product-heading">${similarProduct.name}</h6></a>
                              <span class="badge badge-pill badge-danger text-white py-2 px-3">${similarProduct.price} сом</span>
                          </div>`;
                  }
                }).join("");
              }
            })
            .join("");

          function addToCart() {
            let quantity = 1;
            let totalPrice = product_detail.price;
            let subtractProduct = document.querySelector(".sub-product");
            let addProduct = document.querySelector(".add-product");
            let productQuantity = document.querySelector(".product-quantity");
            let addToCart = document.querySelector(".add-to-cart");


            addProduct.onclick = function () {
              totalPrice += product_detail.price;
              quantity++;
              productQuantity.value = quantity;
            };


            subtractProduct.onclick = function () {
              if (quantity > 1) {
                totalPrice -= product_detail.price;
                quantity--;
                productQuantity.value = quantity;
              }
            };

            addToCart.onclick = function () {

              let cartItems = [];


              let productJson = {
                product_id: product_detail.p_id,
                category_name: category.autoPart,
                product_name: product_detail.name,
                product_description: product_detail.description,
                product_image: product_detail.url1,
                product_quantity: parseInt(productQuantity.value),
                product_price: product_detail.price,
                total_price: totalPrice
              };

              
              if (localStorage.getItem("products") !== null) {

                let previousProducts = JSON.parse(localStorage.getItem("products"));
                previousProducts.forEach(preProduct => {

                  
                  if (preProduct.product_id !== productJson.product_id) {
                    cartItems.push(preProduct);
                  }
                });
              }


              cartItems.push(productJson);


              localStorage.setItem("products", JSON.stringify(cartItems));


              showQuantity();
            };
          }


          addToCart();

        }

      });
    });
  });

}


function showQuantity() {
  let userCart = document.getElementById("user-cart");

  let totalQuantity = 0; 


  let cartCurrentProducts = JSON.parse(localStorage.getItem("products"));

  if (cartCurrentProducts !== null) {

    cartCurrentProducts.forEach(cartCurrentProduct => {
      totalQuantity += cartCurrentProduct.product_quantity;
    });
  }

  userCart.onclick = function () {
    if (totalQuantity === 0) {
      swal("Ваша корзина на данный момент пуста!", "Пожалуйста, выберите товар, чтобы перейти на страницу корзины.", "info");
    }
    else {
      userCart.href = "user-cart.html";
    }
  };


  document.querySelector(".total-quantity").innerHTML = `<span>${totalQuantity}</span>`;

}


getProductDetails();


showQuantity();