let orderList = [];
const url = "https://livejs-api.hexschool.io/api/livejs/v1/admin";
const ordersList = document.querySelector('.orderTableWrap tbody');
function getOrder() {
  axios.get(`${url}/${api_path}/orders`, acesstoken)
    .then((response) => {
      orderList = response.data.orders;
      renderOrder(orderList);
      combinationC3ata();
    })
    .catch((err) => {
      console.log(err);
    })
}
function renderOrder(orderData) {
  let str = '';
  let orderItems = '';
  if (orderData.length === 0) {
    deleteAllbtn.style.display = 'none';
    str = `<td colspan="8" style="text-align:center">目前無訂單資料</td>`;
  }
  else {
    orderData.forEach((dataList) => {
      const timeStatus = new Date(dataList.createdAt * 1000);
      let year = timeStatus.getFullYear();
      let month = timeStatus.getMonth() + 1;
      let date = timeStatus.getDate();
      dataList.products.forEach((product) => {
        orderItems += `${product.title}*${product.quantity}<br>`
      })
      if (month < 10) {
        month = `0${month}`
      }
      if (date < 10) {
        date = `0${date}`
      }
      const orderTime = `${year}/${month}/${date}`;
      str += `
        <tr>
          <td>${dataList.id}</td>
          <td>
            <p>${dataList.user.name}</p>
            <p>${dataList.user.tel}</p>
          </td>
          <td>${dataList.user.address}</td>
          <td>${dataList.user.email}</td>
          <td>
            <p>${orderItems}</p>
          </td>
          <td>${orderTime}</td>
          <td class="orderStatus">
            <a href="#">${dataList.paid ? `<span style = "color: green" data-orderId="${dataList.id}">已處理 </span>` : `<span style = "color: red" data-orderId="${dataList.id}">未處理 </span>`}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderId="${dataList.id}">
          </td>
        </tr>`
    })
  }

  ordersList.innerHTML = str;
}

function deleteAllOrder() {
  Swal.fire({
    title: "確定刪除?",
    text: "所有訂單資料將被刪除!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "刪除"
  })
    .then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${url}/${api_path}/orders`, acesstoken)
          .then((response) => {
            orderList = response.data.orders;
            Swal.fire({
              title: "刪除成功",
              text: "所有訂單資料已被刪除",
              icon: "success"
            });
            renderOrder(orderList);
          })
          .catch((err) => {
            console.log(err);
          })
      }
    })
}
const deleteAllbtn = document.querySelector('.discardAllBtn');
deleteAllbtn.addEventListener('click', (e) => {
  e.preventDefault();
  deleteAllOrder();
})
ordersList.addEventListener('click', (e) => {
  e.preventDefault();
  const orderId = e.target.getAttribute("data-orderId");
  if (e.target.nodeName === 'SPAN') {
    chageStatus(orderId);
  } else if (e.target.nodeName === 'INPUT') {
    deleteOrder(orderId)
  }
  else {
    return;
  }
})

function chageStatus(orderId) {
  let status = {};
  orderList.forEach((order) => {
    if (order.id === orderId) {
      status = order;
    }
  })
  axios.put(`${url}/${api_path}/orders`,
    {
      data: {
        id: orderId,
        paid: !status.paid
      }
    }, acesstoken)
    .then((response) => {
      orderList = response.data.orders;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "訂單狀態已修改",
        showConfirmButton: false,
        timer: 1500
      });
      renderOrder(orderList);
    })
    .catch((err) => {
      console.log(err);
    })
}
function deleteOrder(orderId) {
  Swal.fire({
    title: "確定刪除該筆訂單?",
    text: "該訂單資料將被刪除!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "刪除"
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${url}/${api_path}/orders/${orderId}`, acesstoken)
        .then(response => {
          orderList = response.data.orders;
          Swal.fire({
            title: "刪除成功",
            text: "該筆訂單資料已被刪除",
            icon: "success"
          });
          renderOrder(orderList);
        })
    }
  })
    .catch(err => {
      console.log(err);
    });
}
const chartContent = document.querySelector('#chart');
function combinationC3ata() {
  const obj = {};
  orderList.forEach((order) => {
    order.products.forEach((product) => {
      if (obj[product.category] === undefined) {
        obj[product.category] = product.price * product.quantity
      } else {
        obj[product.category] += product.price * product.quantity
      }
    })
  })
  let data = Object.entries(obj);
  if (data.length === 0) {
    chartContent.innerHTML = `<span style="text-align: center;display: block;">暫無資料</span>`;
  } else {
    renderC3(data);
  }
}

function renderC3(data) {
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
    },
    data: {
      type: "pie",
      columns: data
    }
  });
}
getOrder();
combinationC3ata();