// Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyCpDMwbH3RxMoiI1JvE-r2QAmmmEx4rcIo",
  authDomain: "nearestdeilvery.firebaseapp.com",
  databaseURL: "https://nearestdeilvery-default-rtdb.firebaseio.com",
  projectId: "nearestdeilvery",
  storageBucket: "nearestdeilvery.firebasestorage.app",
  messagingSenderId: "761052936611",
  appId: "1:761052936611:web:99d66e946a5a576ca4c216"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 1. Customer Logic ---
if (document.getElementById('product-list')) {
    db.ref('Products').on('value', snap => {
        let html = "";
        snap.forEach(child => {
            let p = child.val();
            html += `<div class="card">
                <img src="${p.Image}">
                <div class="price">₹${p.Price}</div>
                <div>${p.Name}</div>
                <button onclick="placeOrder('${p.Name}', ${p.Price})">ADD</button>
            </div>`;
        });
        document.getElementById('product-list').innerHTML = html;
    });
}

function placeOrder(name, price) {
    let addr = prompt("Enter Delivery Address:");
    if(addr) {
        db.ref('orders').push({
            item: name, price: price, address: addr, status: 'Pending', time: new Date().toLocaleTimeString()
        });
        alert("Order Placed! Wait for delivery.");
    }
}

// --- 2. Admin Logic (Owner) ---
if (document.getElementById('admin-orders')) {
    // Sound alert for new orders
    db.ref('orders').on('child_added', () => {
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play();
    });

    db.ref('orders').on('value', snap => {
        let html = "";
        snap.forEach(child => {
            let o = child.val();
            if(o.status === 'Pending') {
                html += `<div class="admin-order">
                    <b>${o.item}</b> - ₹${o.price}<br>
                    📍 ${o.address}<br>
                    <small>${o.time}</small>
                </div>`;
            }
        });
        document.getElementById('admin-orders').innerHTML = html;
    });

    // Price Update logic
    db.ref('Products').on('value', snap => {
        let html = "";
        snap.forEach(child => {
            html += `<div>${child.val().Name}: 
                <input type="number" id="p-${child.key}" value="${child.val().Price}">
                <button onclick="updatePrice('${child.key}')" style="width:80px">Set</button>
            </div><br>`;
        });
        document.getElementById('admin-products').innerHTML = html;
    });
}

function updatePrice(id) {
    let newPrice = document.getElementById('p-'+id).value;
    db.ref('Products/'+id).update({ Price: parseInt(newPrice) });
    alert("Price Updated!");
}

// --- 3. Delivery Logic (Swipe) ---
if (document.getElementById('delivery-orders')) {
    db.ref('orders').on('value', snap => {
        let html = "";
        snap.forEach(child => {
            let o = child.val();
            if(o.status === 'Pending') {
                html += `<div class="admin-order">
                    <b>${o.item}</b><br>${o.address}
                    <div class="swipe-box" onclick="swipeDone('${child.key}')">
                        <div class="handle">→</div>
                        CLICK TO DELIVER & PAID
                    </div>
                </div>`;
            }
        });
        document.getElementById('delivery-orders').innerHTML = html;
    });
}

function swipeDone(id) {
    if(confirm("Confirm: Saman de diya aur paise le liye?")) {
        db.ref('orders/'+id).update({ status: 'Delivered', payment: 'Collected' });
    }
}
