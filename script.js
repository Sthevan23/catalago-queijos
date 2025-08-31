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


// ============================
// ESTADO GLOBAL DO CARRINHO
// ============================

// O carrinho é um Map, onde a chave é o id do produto
// Estrutura: cart.set(id, {id, name, price, qty})
const cart = new Map();

// Seletores globais
let itemsNodeList;
let cartCountEl, cartTotalEl, cartTotalModalEl, cartItemsEl, cartEmptyEl;
let cartModalBackdrop, openCartBtn, closeCartBtn, checkoutBtn, checkoutBtnModal, clearCartBtn;


// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', () => {
  // Seleciona todos os elementos necessários
  itemsNodeList = document.querySelectorAll('.item');
  cartCountEl = document.getElementById('cartCount');
  cartTotalEl = document.getElementById('cartTotal');
  cartTotalModalEl = document.getElementById('cartTotalModal');
  cartItemsEl = document.getElementById('cartItems');
  cartEmptyEl = document.getElementById('cartEmpty');
  cartModalBackdrop = document.getElementById('cartModalBackdrop');
  openCartBtn = document.getElementById('openCart');
  closeCartBtn = document.getElementById('closeCart');
  checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtnModal = document.getElementById('checkoutBtnModal');
  clearCartBtn = document.getElementById('clearCart');

  // Eventos dos botões em cada produto (add e remove)
  itemsNodeList.forEach((itemEl) => {
    const btnAdd = itemEl.querySelector('.btn-add');
    const btnRemove = itemEl.querySelector('.btn-remove');
    const quantitySpan = itemEl.querySelector('.quantity');

    // Clicar em "+" adiciona
    btnAdd.addEventListener('click', () => handleQtyChange(itemEl, 1, quantitySpan));
    // Clicar em "-" remove
    btnRemove.addEventListener('click', () => handleQtyChange(itemEl, -1, quantitySpan));
  });

  // Eventos da sacola (abrir, fechar, limpar, finalizar compra)
  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartModalBackdrop.addEventListener('click', (e) => e.target === cartModalBackdrop && closeCart());
  clearCartBtn.addEventListener('click', clearCart);
  checkoutBtn.addEventListener('click', finalizeOrder);
  checkoutBtnModal.addEventListener('click', finalizeOrder);

  // Render inicial do carrinho
  renderCart();
});



// Quando usuário clica em "+" ou "-", atualiza o carrinho
function handleQtyChange(itemEl, delta, span) {
  const info = readItemInfo(itemEl); // pega id, nome e preço do produto
  updateCart(info.id, info.name, info.price, delta); // atualiza no carrinho
  span.textContent = getQty(info.id); // mostra quantidade no produto
  renderCart(); // atualiza modal
}

// Lê informações de um produto no HTML
function readItemInfo(itemEl) {
  return {
    id: itemEl.dataset.id, // atributo data-id
    name: itemEl.querySelector('h2').textContent.trim(), // nome do produto
    price: parseBRL(itemEl.querySelector('.price').textContent.trim()) // preço convertido
  };
}

// Atualiza o carrinho (adiciona ou remove item)
function updateCart(id, name, price, delta) {
  const current = cart.get(id) || { id, name, price, qty: 0 };
  current.qty = Math.max(0, current.qty + delta); // nunca deixa negativo
  current.qty === 0 ? cart.delete(id) : cart.set(id, current);
}

// Retorna a quantidade atual de um item no carrinho
const getQty = (id) => cart.get(id)?.qty || 0;


// ============================
// ATUALIZAÇÃO DO GRID
// ============================
// Sincroniza as quantidades nos cards dos produtos
function syncGrid() {
  itemsNodeList.forEach((el) => {
    el.querySelector('.quantity').textContent = getQty(el.dataset.id);
  });
}


// ============================
// RENDERIZAÇÃO DO CARRINHO
// ============================
function renderCart() {
  let totalItems = 0, totalAmount = 0;

  // Calcula totais
  cart.forEach(({ qty, price }) => {
    totalItems += qty;
    totalAmount += price * qty;
  });

  // Atualiza totais na interface
  cartCountEl.textContent = totalItems;
  cartTotalEl.textContent = formatBRL(totalAmount);
  cartTotalModalEl.textContent = formatBRL(totalAmount);

  const hasItems = totalItems > 0;
  checkoutBtn.disabled = !hasItems;
  checkoutBtnModal.disabled = !hasItems;

  // Se não tiver itens, mostra mensagem de vazio
  cartItemsEl.innerHTML = '';
  if (!hasItems) {
    cartEmptyEl.classList.remove('hidden');
    cartItemsEl.classList.add('hidden');
    return;
  }

  // Caso tenha itens, lista eles no modal
  cartEmptyEl.classList.add('hidden');
  cartItemsEl.classList.remove('hidden');

  cart.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    const totalItem = entry.price * entry.qty;

    // Estrutura do item no carrinho
    row.innerHTML = `
      <div>
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

    // Eventos dos botões dentro do modal
    row.querySelector('[data-action="inc"]').addEventListener('click', () => {
      updateCart(entry.id, entry.name, entry.price, 1);
      syncGrid(); renderCart();
    });
    row.querySelector('[data-action="dec"]').addEventListener('click', () => {
      updateCart(entry.id, entry.name, entry.price, -1);
      syncGrid(); renderCart();
    });
    row.querySelector('.cart-remove').addEventListener('click', () => {
      updateCart(entry.id, entry.name, entry.price, -entry.qty);
      syncGrid(); renderCart();
    });

    cartItemsEl.appendChild(row);
  });
}


// ============================
// CONTROLE DO MODAL
// ============================
function openCart() {
  cartModalBackdrop.classList.remove('hidden');
  cartModalBackdrop.style.display = 'flex';
}
function closeCart() {
  cartModalBackdrop.classList.add('hidden');
  cartModalBackdrop.style.display = 'none';
}
function clearCart() {
  cart.clear();
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

  // Monta lista dos produtos
  cart.forEach(({ name, price, qty }) => {
    const subtotal = price * qty;
    total += subtotal;
    lines.push(`- ${name} | ${formatBRL(price)} x ${qty} = ${formatBRL(subtotal)}`);
  });

  // Total final
  lines.push('', `*Total do pedido: ${formatBRL(total)}*`);

  // Envia para WhatsApp
  const message = encodeURIComponent(lines.join('\n'));
  const phone = '5537991243408'; // seu número no formato internacional
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  closeCart();
}
