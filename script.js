// ============================
// UTILITÁRIOS
// ============================

// Converte texto em formato BRL ("R$ 20,00") para número (20.00)
const parseBRL = (str) => {
  const n = String(str)
    .replace(/\s|R\$/g, '') // remove "R$" e espaços
    .replace(/\./g, '')     // remove pontos de milhar
    .replace(',', '.')      // troca vírgula decimal por ponto
    .trim();
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

// Formata um número em moeda brasileira (ex: 20 -> "R$ 20,00")
const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Função para salvar o carrinho no localStorage
const saveCartToLocalStorage = () => {
  const cartArray = Array.from(cart.entries());
  localStorage.setItem('cart', JSON.stringify(cartArray));
};

// Função para carregar o carrinho do localStorage
const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    const cartArray = JSON.parse(savedCart);
    cartArray.forEach(([id, item]) => cart.set(id, item));
  }
};

// ============================
// ESTADO GLOBAL DO CARRINHO
// ============================

const cart = new Map();

// Elementos DOM
let itemsNodeList;
let cartCountEl, cartTotalEl, cartTotalModalEl, cartItemsEl, cartEmptyEl;
let checkoutBtn, checkoutBtnModal, clearCartBtn;

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', () => {
  // Carregar o carrinho do localStorage
  loadCartFromLocalStorage();

  // Seletores comuns às duas páginas
  itemsNodeList = document.querySelectorAll('.item');
  cartCountEl = document.getElementById('cartCount');
  cartTotalEl = document.getElementById('cartTotal');
  cartTotalModalEl = document.getElementById('cartTotalModal');
  cartItemsEl = document.getElementById('cartItems');
  cartEmptyEl = document.getElementById('cartEmpty');
  checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtnModal = document.getElementById('checkoutBtnModal');
  clearCartBtn = document.getElementById('clearCart');

  // Adicionar eventos aos botões de adicionar/remover em index.html
  if (itemsNodeList.length > 0) {
    itemsNodeList.forEach((itemEl) => {
      const btnAdd = itemEl.querySelector('.btn-add');
      const btnRemove = itemEl.querySelector('.btn-remove');
      const quantitySpan = itemEl.querySelector('.quantity');

      btnAdd.addEventListener('click', () => handleQtyChange(itemEl, 1, quantitySpan));
      btnRemove.addEventListener('click', () => handleQtyChange(itemEl, -1, quantitySpan));
    });
  }

  // Adicionar eventos aos botões de limpar e finalizar (se existirem)
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', finalizeOrder);
  }
  if (checkoutBtnModal) {
    checkoutBtnModal.addEventListener('click', finalizeOrder);
  }

  // Renderizar o carrinho e sincronizar o grid
  syncGrid();
  renderCart();
});

// Quando usuário clica em "+" ou "-", atualiza o carrinho
function handleQtyChange(itemEl, delta, span) {
  const info = readItemInfo(itemEl);
  updateCart(info.id, info.name, info.price, delta, info.image);
  span.textContent = getQty(info.id);
  saveCartToLocalStorage();
  renderCart();
}

// Lê informações de um produto no HTML
function readItemInfo(itemEl) {
  const img = itemEl.querySelector('img');
  return {
    id: itemEl.dataset.id,
    name: itemEl.querySelector('h2').textContent.trim(),
    price: parseBRL(itemEl.querySelector('.price').textContent.trim()),
    image: img ? img.src : 'assets/imagens/placeholder.png' // Fallback para imagem padrão
  };
}

// Atualiza o carrinho (adiciona ou remove item)
function updateCart(id, name, price, delta, image) {
  const current = cart.get(id) || { id, name, price, image, qty: 0 };
  current.qty = Math.max(0, current.qty + delta);
  current.qty === 0 ? cart.delete(id) : cart.set(id, current);
  saveCartToLocalStorage();
}

// Retorna a quantidade atual de um item no carrinho
const getQty = (id) => cart.get(id)?.qty || 0;

// ============================
// ATUALIZAÇÃO DO GRID
// ============================
function syncGrid() {
  if (itemsNodeList) {
    itemsNodeList.forEach((el) => {
      el.querySelector('.quantity').textContent = getQty(el.dataset.id);
    });
  }
}

// ============================
// RENDERIZAÇÃO DO CARRINHO
// ============================
function renderCart() {
  let totalItems = 0, totalAmount = 0;

  // Calcular totais
  cart.forEach(({ qty, price }) => {
    totalItems += qty;
    totalAmount += price * qty;
  });

  // Atualizar a barra fixa da sacola (index.html)
  if (cartCountEl && cartTotalEl) {
    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = formatBRL(totalAmount);
  }

  // Atualizar o total na página da sacola (sacola.html)
  if (cartTotalModalEl) {
    cartTotalModalEl.textContent = formatBRL(totalAmount);
  }

  // Atualizar botões de checkout
  const hasItems = totalItems > 0;
  if (checkoutBtn) {
    checkoutBtn.disabled = !hasItems;
  }
  if (checkoutBtnModal) {
    checkoutBtnModal.disabled = !hasItems;
  }

  // Renderizar itens da sacola (sacola.html)
  if (cartItemsEl && cartEmptyEl) {
    cartItemsEl.innerHTML = '';
    if (!hasItems) {
      cartEmptyEl.classList.remove('hidden');
      cartItemsEl.classList.add('hidden');
    } else {
      cartEmptyEl.classList.add('hidden');
      cartItemsEl.classList.remove('hidden');
      cart.forEach((entry) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        const totalItem = entry.price * entry.qty;

        // Usar a imagem armazenada ou um placeholder se não houver imagem
        const imageSrc = entry.image || 'assets/imagens/placeholder.png';

        row.innerHTML = `
          <div>
            <img src="${imageSrc}" alt="${entry.name}" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="item-name">${entry.name}</div>
            <div class="item-price">${formatBRL(entry.price)} / un.</div>
          </div>
          <div class="cart-qty">
            <button data-action="dec" aria-label="Diminuir">-</button>
            <span>${entry.qty}</span>
            <button data-action="inc" aria-label="Aumentar">+</button>
          </div>
          <div class="item-total">${formatBRL(totalItem)}</div>
          <button class="cart-remove" aria-label="Remover">Remover</button>
        `;

        row.querySelector('[data-action="inc"]').addEventListener('click', () => {
          updateCart(entry.id, entry.name, entry.price, 1, entry.image);
          syncGrid();
          renderCart();
        });
        row.querySelector('[data-action="dec"]').addEventListener('click', () => {
          updateCart(entry.id, entry.name, entry.price, -1, entry.image);
          syncGrid();
          renderCart();
        });
        row.querySelector('.cart-remove').addEventListener('click', () => {
          updateCart(entry.id, entry.name, entry.price, -entry.qty, entry.image);
          syncGrid();
          renderCart();
        });

        cartItemsEl.appendChild(row);
      });
    }
  }
}

// ============================
// LIMPAR CARRINHO
// ============================
function clearCart() {
  cart.clear();
  localStorage.removeItem('cart');
  syncGrid();
  renderCart();
}

// ============================
// FINALIZAÇÃO DO PEDIDO (WHATSAPP)
// ============================
function finalizeOrder() {
  if (cart.size === 0) return;
  const lines = ['Olá! Quero fazer um pedido:\n'];
  let total = 0;

  cart.forEach(({ name, price, qty }) => {
    const subtotal = price * qty;
    total += subtotal;
    lines.push(`- ${name} | ${formatBRL(price)} x ${qty} = ${formatBRL(subtotal)}`);
  });

  lines.push('', `*Total do pedido: ${formatBRL(total)}*`);

  const message = encodeURIComponent(lines.join('\n'));
  const phone = '5537991243408';
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}