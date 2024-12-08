const url = "https://livejs-api.hexschool.io/api/livejs/v1/customer"
let beddingInfo = [];
let filterAry = [];
let cartLIst = [];
let total = 0;
let carts = [];
let price = 0;
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const totalPrice = document.querySelector('.total');
document.addEventListener('DOMContentLoaded', function () {
  const ele = document.querySelector('.recommendation-wall');
  ele.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function (e) {
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };
  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function () {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener('mousedown', mouseDownHandler);
});

function getProductList() {
  axios.get(`${url}/${api_path}/products`).
    then(function (response) {
      beddingInfo = response.data.products;
      renderProductList(beddingInfo);
    })
    .catch(function (error) {
      console.log(error)
    })
}

function renderProductList(data) {
  let str = "";
  data.forEach((beddingData) => {
    str += `<li class="productCard">
    <h4 class="productType">${beddingData.category}</h4>
    <img
      src="${beddingData.images}"
      alt="">
    <a href="#" class="addCardBtn" data-id="${beddingData.id}">加入購物車</a>
    <h3>${beddingData.title}</h3>
    <del class="originPrice">NT$${formatNumber(beddingData.origin_price)}</del>
    <p class="nowPrice">NT$${formatNumber(beddingData.price)}</p>
  </li>`
  })
  productWrap.innerHTML = str;
}

const buyBtn = document.querySelector('.productWrap');
buyBtn.addEventListener("click", addProduct)
function addProduct(e) {

  e.preventDefault();
  const className = e.target.className;
  const id = e.target.getAttribute("data-id");
  if (className === 'addCardBtn') {
    addToCart(id);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "該商品已經被加入購物車列表內",
      showConfirmButton: false,
      timer: 1500
    });
  }
}

const overflowWrap = document.querySelector('.shoppingCart-table tbody');
const deleteBtn = document.querySelector(".discardAllBtn");
function getCart() {
  axios.get(`${url}/${api_path}/carts`)
    .then((response) => {
      cartLIst = response.data.carts;
      total = response.data.finalTotal;
      renderCart(cartLIst)
    })
    .catch((err) => {
      console.log(err);
    })
}
function renderCart(cartLIst) {
  let str = '';
  if (cartLIst.length === 0) {
    str = '<tr><td colspan="8" style="text-align:center">目前購物列表內無商品</td></tr>';
    deleteBtn.style.visibility = 'hidden';
    totalPrice.textContent = `${0}`;
  } else {
    cartLIst.forEach((cartItem) => {
      str += `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${cartItem.product.images}" alt="">
                <p>${cartItem.product.title}</p>
              </div>
            </td>
            <td>NT$${formatNumber(cartItem.product.price)}</td>
            <td>${cartItem.quantity}</td>
            <td>NT$${formatNumber(cartItem.product.price * cartItem.quantity)}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id=${cartItem.id}>
                clear
              </a>
            </td>
          </tr>`
    })
    // deleteBtn.style.visibility = 'hidden';
    deleteBtn.style.visibility = 'visible';
    totalPrice.textContent = `${formatNumber(total)}`;
  }
  overflowWrap.innerHTML = str;
}

function addToCart(productId) {
  let num = 1;
  cartLIst.forEach((item) => {
    if (item.product.id === productId) {
      num = item.quantity += 1;
    }
  })
  axios.post(`${url}/${api_path}/carts`, {
    data: {
      productId: productId,
      quantity: num
    }
  })
    .then(function (response) {
      console.log(response.data);
      cartLIst = response.data.carts;
      total = response.data.finalTotal;
      console.log(cartLIst);
      renderCart(cartLIst);

    })
    .catch(function (error) {
      console.log(error)
    })
}

productSelect.addEventListener('change', (e) => {
  if (e.target.value === "全部") {
    filterAry = beddingInfo;
  } else {
    filterAry = beddingInfo.filter((item) => e.target.value === item.category);
  }
  renderProductList(filterAry);
})

const tbody = document.querySelector(".shoppingCart-table tbody");
tbody.addEventListener('click', (e) => {
  e.preventDefault();
  const id = e.target.getAttribute("data-id");
  deleteCart(id);
})
function deleteCart(deleteID) {
  axios.delete(`${url}/${api_path}/carts/${deleteID}`)
    .then((response) => {
      total = response.data.finalTotal;
      cartLIst = response.data.carts;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "該商品已經被刪除",
        showConfirmButton: false,
        timer: 1500
      });
      getCart();
    })
    .catch(function (error) {
      console.log(error)
    })
}

deleteBtn.addEventListener('click', (e) => {
  e.preventDefault();
  deleteAllCart();
})
function deleteAllCart() {
  axios.delete(`${url}/${api_path}/carts`)
    .then((response) => {
      total = response.data.finalTotal;
      cartLIst = response.data.carts;
      console.log(total, cartLIst);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "購物車商品皆已清空",
        showConfirmButton: false,
        timer: 1500
      });
      getCart();
    })
    .catch(function (error) {
      console.log(error)
    })
}
const formData = document.querySelector(".orderInfo-form")
const messages = document.querySelectorAll('[data-message]');
const inputs = document.querySelectorAll("input[type=text], input[type=tel], input[type=email]");
//驗證表單規則
const constraints = {
  姓名: {
    presence: {
      message: "必填欄位"
    },
  },
  電話: {
    presence: {
      message: "必填欄位"
    },
    format: {
      pattern: /^09\d{8}$/,
      message: "需以09開頭，共10碼"
    },
    length: {
      minimum: 8,
      message: "號碼需超過8碼"
    }
  },
  Email: {
    presence: {
      message: "是必填欄位"
    },
    email: {
      message: "格式有誤"
    }
  },
  寄送地址: {
    presence: {
      message: "是必填欄位"
    }
  },
  交易方式: {
    presence: {
      message: "是必填欄位"
    },
  }

}

formData.addEventListener("submit", verification)

function verification(e) {
  e.preventDefault();
  let errors = validate(formData, constraints);
  if (errors) {
    showErrors(errors);
  } else {
    sendOrders(e);
  }
}
function sendOrders(e) {
  if (cartLIst.length === 0) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "購物車內目前無選購商品",
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }
  else {
    let orderData = {
      data: {
        user: {
          name: e.target[0].value.trim(),
          tel: e.target[1].value.trim(),
          email: e.target[2].value.trim(),
          address: e.target[3].value.trim(),
          payment: e.target[4].value.trim()
        }
      }
    }
    axios.post(`${url}/${api_path}/orders`, orderData)
      .then((response) => {
        console.log(response.data.status);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "訂單已送出",
          showConfirmButton: false,
          timer: 1500
        });
        getCart();
      })
      .catch(function (error) {
        console.log(error)
      })
    formData.reset();
  }
}
function showErrors(errors) {
  messages.forEach((item) => {
    item.textContent = "";
    item.textContent = errors[item.dataset.message];
  });
}

inputs.forEach((item) => {
  item.addEventListener("change", () => {
    validateField(item);
  });
})

function validateField(item) {
  let errors = validate(formData, constraints);
  let targetMsg = document.querySelector(`[data-message=${item.name}]`);
  if (errors) {
    targetMsg.textContent = errors[item.name];
  } else {
    targetMsg.textContent = "";
  }
}
function formatNumber(number) {
  let parts = number.toString().split('.'); // 分割整數和小數部分
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 格式化整數部分
  return parts.length > 1 ? parts.join('.') : parts[0]; // 拼接小數部分
}
getProductList();
getCart();