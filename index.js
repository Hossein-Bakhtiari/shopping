const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItem = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart =document.querySelector(".clear-cart");

import {productsData} from "./products.js"

let cart = []; 

// 1. get products
class Products{
    getProducts() {
      return productsData;
    }
}


// 2. display Products
let buttonsDOM = [];

class UI {
  displayProducts(products){
    let result = "";
    products.forEach(item => {
       result += `
       <div class="product">
            <div class="img-container">
              <img class="product-img" src=${item.imageUrl} >
            </div>
            <div class="product-desc">
              <p class="product-title">${item.title}</p>
              <p class="product-price">$ ${item.price}</p>
            </div>
            <button class="btn add-to-cart" data-id= ${item.id}>add to cart 
             
            </button>
          </div>`;
          productsDOM.innerHTML = result;
    });
  }
  getAddToCartBtn(){
    const addTocartBtns = [...document.querySelectorAll(".add-to-cart")];
    // const buttonsDOM = addTocartBtns;
    // const buttons = [...addTocartBtns];
    buttonsDOM = addTocartBtns;

    addTocartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart or not !?
      const isInCart = cart.find( (p) => p.id === parseInt(id));
      if(isInCart) {
        btn.innerText = "In cart";
        btn.disabled = true ;
      }


      btn.addEventListener("click" , (event)=>{
        event.target.innerText= "In cart";
        event.target.disabled = true;
        // console.log(event.target.dataset.id);
        // get product from products
        const addedProduct = {...Storage.getProduct(id) , quantitiy : 1};
        // add to cart
        cart = [...cart ,addedProduct];
        // save cart to local storage
        Storage.saveCart(cart);
        // update cart value
        this.setCartValue(cart);
        // add to cart item
        this.addCartItem(addedProduct);
      });
    });
  }
  setCartValue(cart){
    // 1. cart items
    // 2. cartctotal price:
     let tempCartItems = 0 ;
     const totalPrice = cart.reduce((acc,curr)=>{
       tempCartItems += curr.quantitiy;
        return acc + curr.quantitiy * curr.price;
     }, 0);
   cartTotal.innerText = `total Price : ${totalPrice.toFixed(2)}$`;
   cartItem.innerText = tempCartItems;

  }
  addCartItem(cartItem){
    const div =document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img class="cart-item-img" src=${cartItem.imageUrl} alt="p-1">
          <div class="cart-item-desc">
            <h4 class=${cartItem.title}>Villag Toney</h4>
            <h5 class="product-price">${cartItem.price} $</h5>
          </div>
          <div class="cart-item-conteoller">
            <i class="fa fa-chevron-up" data-id=${cartItem.id}></i></i>
            <p>${cartItem.quantitiy}</p>
            <i class="fa fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
            <i class="fa fa-trash-alt" data-id=${cartItem.id}></i>`
            cartContent.appendChild(div);
  }
  setUpApp(){
    // get cart from storage
   cart = Storage.getCart() || [];
    // addCartItem
    cart.forEach((cartItem)=> this.addCartItem(cartItem));
    // setValue = price + item
    this.setCartValue(cart);
  }

  cartLogic(){
    // clear cart
    clearCart.addEventListener( "click" , ()=> this.clearCart() );
    cartContent.addEventListener("click" , (event)=>{
      if (event.target.classList.contains("fa-chevron-up")){
        console.log(event.target.dataset.id);
        const addQuantity = event.target;
        // get item from cart
        const addedItem = cart.find((citem) => citem.id == addQuantity.dataset.id);
        addedItem.quantitiy++;
        // save cart 
        this.setCartValue(cart);
        // uodate cart value
        Storage.saveCart(cart);
        // update cart item in ui :
        addQuantity.nextElementSibling.innerText = addedItem.quantitiy; 
      }else if(event.target.classList.contains("fa-trash-alt")){
        const removeItem = event.target;
        const _removedItem = cart.find((c)=> c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
        // remove from cartItem
      }else if(event.target.classList.contains("fa-chevron-down")){
        const subQuantity = event.target;
        const substractedItem = cart.find((c)=> c.id == subQuantity.dataset.id);
        if(substractedItem.quantitiy == 1){
          this.removeItem(substractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantitiy--;
        this.setCartValue(cart);
        // saave cart
        Storage.saveCart(cart);
        // update cart in ui:
        subQuantity.previousElementSibling.innerText = substractedItem.quantitiy;
        
      }
    });
  }

  clearCart(){
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children :
    
    while(cartContent.children.length){
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }

  removeItem(id){
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    //total price and cart items:
    this.setCartValue(cart);
      // update storage:
      Storage.saveCart(cart);

     // get add to cart btns => update text and disable 
    this.getSingleButton(id);
}

  getSingleButton(id){
    const button = buttonsDOM.find((btn)=> parseInt(btn.dataset.id) === parseInt(id));
    button.innerText = "add to cart";
    button.disabled = false ;
  }
}



// 3. Storage
class Storage{
  static saveProducts(products) {
    localStorage.setItem("products" , JSON.stringify(products));
  }
  static getProduct(id){
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p)=> p.id == parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart" , JSON.stringify(cart));
  }
  static getCart(){
    return JSON.parse(localStorage.getItem("cart"));
    
  }
}

document.addEventListener("DOMContentLoaded" ,()=>{
  // console.log("loaded");
  const products = new Products();
  const productsData = products.getProducts();
  // set up : get cart and set up app :
  const ui = new UI();
  ui.setUpApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtn();
  ui.cartLogic();
  Storage.saveProducts(productsData);
} );


// cart items modal

function showModalFunction(){
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}


function closeModalFunction(){
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}


cartBtn.addEventListener("click" , showModalFunction);
closeModal.addEventListener("click" , closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);