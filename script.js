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

// URL da API
const API_URL = 'http://localhost:8000';

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', async () => {
  // Seletores comuns às duas páginas
  const itemsNodeList = document.querySelectorAll('.item');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartTotalModalEl = document.getElementById('cartTotalModal');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutBtnModal = document.getElementById('checkoutBtnModal');
  const clearCartBtn = document.getElementById('clearCart');

  // Adicionar eventos aos botões de adicionar/remover em index.html
  if (itemsNodeList.length > 0) {
    itemsNodeList.forEach((itemEl) => {
      const btnAdd = itemEl.querySelector('.btn-add');
      const btnRemove = itemEl.querySelector('.btn-remove');
      const quantitySpan = itemEl.querySelector('.quantity');

      btnAdd.addEventListener('click', async () => {
        await handleQtyChange(itemEl, 1, quantitySpan);
      });
      btnRemove.addEventListener('click', async () => {
        await handleQtyChange(itemEl, -1, quantitySpan);
      });
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

  // Carregar o carrinho da API e sincronizar o grid
  await syncGrid();
  await renderCart();
});

// Quando usuário clica em "+" ou "-", atualiza o carrinho
async function handleQtyChange(itemEl, delta, span) {
  const info = readItemInfo(itemEl);
  const currentQty = await getQty(info.id);
  const newQty = Math.max(0, currentQty + delta);

  if (newQty === 0) {
    await removeFromCart(info.id);
  } else {
    await updateCart(info.id, info.name, info.price, newQty, info.image);
  }

  span.textContent = newQty;
  await renderCart();
}

// Lê informações de um produto no HTML
function readItemInfo(itemEl) {
  const img = itemEl.querySelector('img');
  return {
    id: itemEl.dataset.id,
    name: itemEl.querySelector('h2').textContent.trim(),
    price: parseBRL(itemEl.querySelector('.price').textContent.trim()),
    image: img ? img.src : `${window.location.origin}/assets/imagens/placeholder.png` // Fallback para imagem padrão
  };
}

// Atualiza o carrinho na API
async function updateCart(id, name, price, qty, image) {
  try {
    await fetch(`${API_URL}/cart/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, price, qty, image })
    });
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
  }
}

// Remove item do carrinho na API
async function removeFromCart(id) {
  try {
    await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
  }
}

// Retorna a quantidade atual de um item no carrinho
async function getQty(id) {
  try {
    const response = await fetch(`${API_URL}/cart/`);
    const cartItems = await response.json();
    const item = cartItems.find(item => item.id === id);
    return item ? item.qty : 0;
  } catch (error) {
    console.error('Erro ao obter quantidade:', error);
    return 0;
  }
}

// ============================
// ATUALIZAÇÃO DO GRID
// ============================
async function syncGrid() {
  try {
    const response = await fetch(`${API_URL}/cart/`);
    const cartItems = await response.json();
    const itemsNodeList = document.querySelectorAll('.item');
    itemsNodeList.forEach((el) => {
      const itemId = el.dataset.id;
      const item = cartItems.find(item => item.id === itemId);
      el.querySelector('.quantity').textContent = item ? item.qty : 0;
    });
  } catch (error) {
    console.error('Erro ao sincronizar grid:', error);
  }
}

// ============================
// RENDERIZAÇÃO DO CARRINHO
// ============================
async function renderCart() {
  let totalItems = 0, totalAmount = 0;

  try {
    const response = await fetch(`${API_URL}/cart/`);
    const cartItems = await response.json();

    // Calcular totais
    cartItems.forEach(({ qty, price }) => {
      totalItems += qty;
      totalAmount += price * qty;
    });

    // Atualizar a barra fixa da sacola (index.html)
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartCountEl && cartTotalEl) {
      cartCountEl.textContent = totalItems;
      cartTotalEl.textContent = formatBRL(totalAmount);
    }

    // Atualizar o total na página da sacola (sacola.html)
    const cartTotalModalEl = document.getElementById('cartTotalModal');
    if (cartTotalModalEl) {
      cartTotalModalEl.textContent = formatBRL(totalAmount);
    }

    // Atualizar botões de checkout
    const hasItems = totalItems > 0;
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutBtnModal = document.getElementById('checkoutBtnModal');
    if (checkoutBtn) {
      checkoutBtn.disabled = !hasItems;
    }
    if (checkoutBtnModal) {
      checkoutBtnModal.disabled = !hasItems;
    }

    // Renderizar itens da sacola (sacola.html)
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    if (cartItemsEl && cartEmptyEl) {
      cartItemsEl.innerHTML = '';
      if (!hasItems) {
        cartEmptyEl.classList.remove('hidden');
        cartItemsEl.classList.add('hidden');
      } else {
        cartEmptyEl.classList.add('hidden');
        cartItemsEl.classList.remove('hidden');
        cartItems.forEach((entry) => {
          const row = document.createElement('div');
          row.className = 'cart-item';
          const totalItem = entry.price * entry.qty;

          // Usar a imagem armazenada ou um placeholder se não houver imagem
          const imageSrc = entry.image || `${window.location.origin}/assets/imagens/placeholder.png`;

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

          row.querySelector('[data-action="inc"]').addEventListener('click', async () => {
            await updateCart(entry.id, entry.name, entry.price, entry.qty + 1, entry.image);
            await syncGrid();
            await renderCart();
          });
          row.querySelector('[data-action="dec"]').addEventListener('click', async () => {
            const newQty = Math.max(0, entry.qty - 1);
            if (newQty === 0) {
              await removeFromCart(entry.id);
            } else {
              await updateCart(entry.id, entry.name, entry.price, newQty, entry.image);
            }
            await syncGrid();
            await renderCart();
          });
          row.querySelector('.cart-remove').addEventListener('click', async () => {
            await removeFromCart(entry.id);
            await syncGrid();
            await renderCart();
          });

          cartItemsEl.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao renderizar carrinho:', error);
  }
}

// ============================
// LIMPAR CARRINHO
// ============================
async function clearCart() {
  try {
    await fetch(`${API_URL}/cart/`, { method: 'DELETE' });
    await syncGrid();
    await renderCart();
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
  }
}

// ============================
// FINALIZAÇÃO DO PEDIDO (WHATSAPP)
// ============================
async function finalizeOrder() {
  try {
    const response = await fetch(`${API_URL}/cart/`);
    const cartItems = await response.json();
    if (cartItems.length === 0) return;

    const orderResponse = await fetch(`${API_URL}/order/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems })
    });
    const { whatsapp_url } = await orderResponse.json();
    window.open(whatsapp_url, '_blank');

    // Limpar carrinho após finalizar
    await fetch(`${API_URL}/cart/`, { method: 'DELETE' });
    await syncGrid();
    await renderCart();
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
  }
}