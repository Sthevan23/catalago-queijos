from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from urllib.parse import quote

app = FastAPI()

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # URL do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de dados para um item do catálogo
class Item(BaseModel):
    id: str
    name: str
    price: float
    details: str
    image: str
    category: str

# Modelo de dados para um item no carrinho
class CartItem(BaseModel):
    id: str
    name: str
    price: float
    qty: int
    image: str

# Modelo de dados para o pedido
class OrderRequest(BaseModel):
    items: List[CartItem]

# Banco de dados simulado (baseado no HTML)
items_db = [
    {
        "id": "0",
        "name": "QUEIJO PALITO",
        "price": 31.90,
        "details": "450g - queijo em palito artesanal",
        "image": "assets/imagens/tradicionais/foto1.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "1",
        "name": "QUEIJO TRANÇA",
        "price": 31.90,
        "details": "450g - pura, defumada, alho ou temperada",
        "image": "assets/imagens/tradicionais/foto2.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "2",
        "name": "QUEIJO NOZINHO",
        "price": 31.90,
        "details": "450g - tradicional artesanal",
        "image": "assets/imagens/tradicionais/foto3.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "3",
        "name": "KIT TRANÇA",
        "price": 29.00,
        "details": "450g - kit com tranças variadas",
        "image": "assets/imagens/tradicionais/foto4.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "4",
        "name": "QUEIJO TIPO REINO",
        "price": 40.00,
        "details": "450g - queijo tipo reino tradicional",
        "image": "assets/imagens/tradicionais/foto5.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "5",
        "name": "QUEIJO PROVOLONE RECHEADO COM SALAME",
        "price": 31.00,
        "details": "450g - provolone artesanal recheado",
        "image": "assets/imagens/tradicionais/foto6.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "6",
        "name": "QUEIJO TRANÇA",
        "price": 31.90,
        "details": "450g - queijo trança artesanal",
        "image": "assets/imagens/tradicionais/foto7.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "7",
        "name": "QUEIJO PROVOLONE",
        "price": 35.00,
        "details": "450g - provolone artesanal",
        "image": "assets/imagens/tradicionais/foto8.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "8",
        "name": "KIT PROVOLETO",
        "price": 38.00,
        "details": "450g - kit de provolones especiais",
        "image": "assets/imagens/tradicionais/foto9.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "9",
        "name": "KIT PROVOLONE C/ LOMBO",
        "price": 38.00,
        "details": "450g - provolone com lombo defumado",
        "image": "assets/imagens/tradicionais/foto10.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "10",
        "name": "KIT QUATRO QUEIJOS",
        "price": 40.00,
        "details": "450g - seleção de quatro queijos",
        "image": "assets/imagens/tradicionais/foto11.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "11",
        "name": "QUEIJO CABACINHA",
        "price": 37.00,
        "details": "450g - queijo cabacinha artesanal",
        "image": "assets/imagens/tradicionais/foto12.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "12",
        "name": "QUEIJO MINAS PADRÃO",
        "price": 39.00,
        "details": "450g - queijo minas padrão tradicional",
        "image": "assets/imagens/tradicionais/foto13.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "13",
        "name": "QUEIJO MINAS COM GOIABADA",
        "price": 40.00,
        "details": "450g - combinação clássica queijo e goiabada",
        "image": "assets/imagens/tradicionais/foto14.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "14",
        "name": "QUEIJO MINAS",
        "price": 39.90,
        "details": "450g - queijo minas artesanal",
        "image": "assets/imagens/tradicionais/foto15.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "15",
        "name": "QUEIJO MINAS FRESCAL LIGHT",
        "price": 39.90,
        "details": "450g - versão light do minas frescal",
        "image": "assets/imagens/tradicionais/foto16.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "16",
        "name": "QUEIJO TRANÇA AO VINHO",
        "price": 31.90,
        "details": "450g - trança curada no vinho",
        "image": "assets/imagens/tradicionais/foto17.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "17",
        "name": "QUEIJO COALHO BARRA",
        "price": 26.00,
        "details": "450g - barra de coalho artesanal",
        "image": "assets/imagens/tradicionais/foto18.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "18",
        "name": "REQUEIJÃO EM BARRA",
        "price": 27.00,
        "details": "450g - requeijão em formato de barra",
        "image": "assets/imagens/tradicionais/foto19.png",
        "category": "Queijos Tradicionais"
    },
    {
        "id": "19",
        "name": "CHIPS DE PROVOLONE PURO",
        "price": 31.90,
        "details": "180g - Crocante e saboroso",
        "image": "assets/imagens/chips_queijo/chips1.png",
        "category": "Desidratados"
    },
    {
        "id": "20",
        "name": "CHIPS DE PROVOLONE COM CHIMICHURRI",
        "price": 31.90,
        "details": "180g - Sabor com tempero especial",
        "image": "assets/imagens/chips_queijo/chips2.png",
        "category": "Desidratados"
    },
    {
        "id": "21",
        "name": "CHIPS DE PROVOLONE RECHEADO COM GOIABADA",
        "price": 31.90,
        "details": "180g - Goiabada e queijo",
        "image": "assets/imagens/chips_queijo/chips3.png",
        "category": "Desidratados"
    },
    {
        "id": "22",
        "name": "CHIPS TIPO GOUDA",
        "price": 31.90,
        "details": "180g - Sabor suave e crocante",
        "image": "assets/imagens/chips_queijo/chips4.png",
        "category": "Desidratados"
    },
    {
        "id": "23",
        "name": "CHIPS DE QUEIJO COALHO",
        "price": 31.90,
        "details": "180g - Sabor clássico do Nordeste",
        "image": "assets/imagens/chips_queijo/chips5.png",
        "category": "Desidratados"
    },
    {
        "id": "29",
        "name": "QUEIJO RECHEADO COM REQUEIJÃO, DAMASCO E AVELÃ",
        "price": 44.90,
        "details": "700g - Doce e cremoso",
        "image": "assets/imagens/trufados/trufado1.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "30",
        "name": "QUEIJO RECHEADO COM REQUEIJÃO E TOMATE SECO",
        "price": 41.90,
        "details": "500g - Leve e aromático",
        "image": "assets/imagens/trufados/trufado2.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "31",
        "name": "QUEIJO RECHEADO COM CHEDDAR",
        "price": 41.90,
        "details": "500g - Sabor intenso",
        "image": "assets/imagens/trufados/trufado3.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "32",
        "name": "QUEIJO RECHEADO COM REQUEIJÃO E AZEITONA",
        "price": 40.90,
        "details": "800g - Salgado e marcante",
        "image": "assets/imagens/trufados/trufado4.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "33",
        "name": "QUEIJO RECHEADO COM CHEDDAR E CARNE SECA",
        "price": 44.90,
        "details": "500g - Robusto e saboroso",
        "image": "assets/imagens/trufados/trufado5.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "34",
        "name": "QUEIJO RECHEADO COM REQUEIJÃO",
        "price": 40.90,
        "details": "500g - Leve e cremoso",
        "image": "assets/imagens/trufados/trufado6.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "35",
        "name": "QUEIJO RECHEADO COM GOIABADA",
        "price": 44.90,
        "details": "500g - Goiabada cremosa",
        "image": "assets/imagens/trufados/trufado7.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "36",
        "name": "QUEIJO RECHEADO COM NUTELLA",
        "price": 44.90,
        "details": "500g - Nutella cremosa",
        "image": "assets/imagens/trufados/trufado8.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "37",
        "name": "QUEIJO RECHEADO COM DOCE DE LEITE",
        "price": 44.90,
        "details": "500g - Doce suave",
        "image": "assets/imagens/trufados/trufado9.png",
        "category": "Queijos Trufados"
    },
    {
        "id": "38",
        "name": "QUEIJO CANASTRA MEIA-CURA",
        "price": 39.90,
        "details": "500g - Tradição mineira",
        "image": "assets/imagens/queijos_finos/foto1.png",
        "category": "Queijos Finos"
    },
    {
        "id": "39",
        "name": "QUEIJO PARMESÃO CUNHA",
        "price": 34.90,
        "details": "400g - Toque marcante",
        "image": "assets/imagens/queijos_finos/foto2.png",
        "category": "Queijos Finos"
    },
    {
        "id": "40",
        "name": "QUEIJO CANASTRA SERJÃO",
        "price": 99.90,
        "details": "1100g - Doce mineiro",
        "image": "assets/imagens/queijos_finos/foto3.png",
        "category": "Queijos Finos"
    },
    {
        "id": "41",
        "name": "KIT PARMESÃO ARTESANAL (DEFUMADO, TEMPERADO, VINHO E TRADICIONAL)",
        "price": 34.90,
        "details": "180g - Sabores variados",
        "image": "assets/imagens/queijos_finos/foto4.png",
        "category": "Queijos Finos"
    },
    {
        "id": "42",
        "name": "QUEIJO CANASTRA MOLDURA",
        "price": 89.90,
        "details": "1000g - Sabor autêntico da canastra",
        "image": "assets/imagens/queijos_finos/foto5.png",
        "category": "Queijos Finos"
    },
    {
        "id": "43",
        "name": "QUEIJO GORGONZOLA",
        "price": 31.90,
        "details": "125g - Aroma intenso",
        "image": "assets/imagens/queijos_finos/foto6.png",
        "category": "Queijos Finos"
    },
    {
        "id": "44",
        "name": "QUEIJO CANASTRA BARREIRINHA",
        "price": 84.90,
        "details": "1000g - Aroma intenso",
        "image": "assets/imagens/queijos_finos/foto7.jpeg",
        "category": "Queijos Finos"
    },
    {
        "id": "45",
        "name": "QUEIJO BRISA",
        "price": 61.90,
        "details": "450g - Sabor marcante, perfeito para molhos",
        "image": "assets/imagens/queijos_finos/foto8.png",
        "category": "Queijos Finos"
    },
    {
        "id": "46",
        "name": "QUEIJO CANASTRA JOHNNE PREMIADO",
        "price": 99.90,
        "details": "1000g - Premiado e cheio de personalidade",
        "image": "assets/imagens/queijos_finos/foto9.png",
        "category": "Queijos Finos"
    },
    {
        "id": "47",
        "name": "PANELA DE QUEIJO PARMESÃO",
        "price": 54.90,
        "details": "600g - Ideal para receitas criativas",
        "image": "assets/imagens/queijos_finos/foto10.png",
        "category": "Queijos Finos"
    },
    {
        "id": "48",
        "name": "QUEIJO CANASTRA REINALDO",
        "price": 110.00,
        "details": "1000g - Autêntico sabor mineiro",
        "image": "assets/imagens/queijos_finos/foto11.png",
        "category": "Queijos Finos"
    },
    {
        "id": "49",
        "name": "KIT PARMESÃO (TRADICIONAL, CAPA PRETA, DEFUMADO E TEMPERADO)",
        "price": 39.90,
        "details": "125g - Variedade para todos os paladares",
        "image": "assets/imagens/queijos_finos/foto12.png",
        "category": "Queijos Finos"
    },
    {
        "id": "50",
        "name": "BURRATA DE BÚFALA",
        "price": 31.90,
        "details": "250g - Cremosa e sofisticada",
        "image": "assets/imagens/queijos_finos/foto13.png",
        "category": "Queijos Finos"
    },
    {
        "id": "51",
        "name": "QUEIJO MORBIER",
        "price": 41.90,
        "details": "500g - Clássico francês de sabor único",
        "image": "assets/imagens/queijos_finos/foto14.png",
        "category": "Queijos Finos"
    },
    {
        "id": "52",
        "name": "QUEIJO TIPO BRIE",
        "price": 31.90,
        "details": "180g - Delicado e saboroso",
        "image": "assets/imagens/queijos_finos/foto15.png",
        "category": "Queijos Finos"
    },
    {
        "id": "53",
        "name": "QUEIJO CAMEMBERT",
        "price": 41.90,
        "details": "350g - Cremoso e sofisticado",
        "image": "assets/imagens/queijos_finos/foto16.png",
        "category": "Queijos Finos"
    },
    {
        "id": "54",
        "name": "QUEIJO MUSSARELA DE BÚFALA EM BOLINHA (TRADICIONAL, AZEITONA, DAMASCO E CEREJA)",
        "price": 34.90,
        "details": "250g - Frescor e versatilidade em cada bolinha",
        "image": "assets/imagens/queijos_finos/foto17.png",
        "category": "Queijos Finos"
    },
    {
        "id": "55",
        "name": "QUEIJO GRANA PANADO",
        "price": 31.90,
        "details": "220g - Encorpado, ideal para massas",
        "image": "assets/imagens/queijos_finos/foto18.png",
        "category": "Queijos Finos"
    },
    {
        "id": "56",
        "name": "PRESUNTO TENRO BOLINHA JULIATTO",
        "price": 69.90,
        "details": "700g - Macio, defumado e sabor marcante",
        "image": "assets/imagens/especiarias/foto1.png",
        "category": "Especiarias"
    },
    {
        "id": "57",
        "name": "PICANHA SUÍNA",
        "price": 41.90,
        "details": "650g - Suculenta, com tempero especial",
        "image": "assets/imagens/especiarias/foto2.png",
        "category": "Especiarias"
    },
    {
        "id": "58",
        "name": "PICANHA COM PROVOLONE",
        "price": 47.90,
        "details": "700g - Combinação irresistível de carne e queijo",
        "image": "assets/imagens/especiarias/foto3.png",
        "category": "Especiarias"
    },
    {
        "id": "59",
        "name": "CARNE NA LATA CANASTRA",
        "price": 52.90,
        "details": "900g - Receita tradicional com sabor autêntico",
        "image": "assets/imagens/especiarias/foto4.png",
        "category": "Especiarias"
    },
    {
        "id": "60",
        "name": "LOMBO NOBRE DEFUMADO C/ PIMENTA BIQUINHO",
        "price": 24.90,
        "details": "200g - Defumado artesanal, toque suave da pimenta biquinho",
        "image": "assets/imagens/salaminhos/foto1.png",
        "category": "Salaminhos"
    },
    {
        "id": "61",
        "name": "LOMBO NOBRE DEFUMADO C/ ALHO",
        "price": 24.90,
        "details": "200g - Sabor marcante com o toque especial do alho",
        "image": "assets/imagens/salaminhos/foto2.png",
        "category": "Salaminhos"
    },
    {
        "id": "62",
        "name": "SALAME ITALIANO FATIADO",
        "price": 24.90,
        "details": "200g - Receita clássica italiana, sabor intenso e equilibrado",
        "image": "assets/imagens/salaminhos/foto3.png",
        "category": "Salaminhos"
    },
    {
        "id": "63",
        "name": "SALAMINHO C/ AZEITONA",
        "price": 24.90,
        "details": "200g - Combinação saborosa de salame com azeitonas selecionadas",
        "image": "assets/imagens/salaminhos/foto4.png",
        "category": "Salaminhos"
    },
    {
        "id": "64",
        "name": "LOMBO NOBRE DEFUMADO C/ PIMENTA CALABRESA",
        "price": 24.90,
        "details": "200g - Defumado intenso com o toque picante da calabresa",
        "image": "assets/imagens/salaminhos/foto5.png",
        "category": "Salaminhos"
    },
    {
        "id": "65",
        "name": "SALAME FRANGO C/ AZEITONA",
        "price": 24.90,
        "details": "200g - Leve, saboroso e realçado com azeitonas selecionadas",
        "image": "assets/imagens/salaminhos/foto6.png",
        "category": "Salaminhos"
    },
    {
        "id": "66",
        "name": "SALAME FRANGO C/ PROVOLONE",
        "price": 24.90,
        "details": "200g - Combinação única de frango suave e queijo provolone",
        "image": "assets/imagens/salaminhos/foto7.png",
        "category": "Salaminhos"
    },
    {
        "id": "67",
        "name": "LOMBO NOBRE DEFUMADO",
        "price": 24.90,
        "details": "200g - Clássico e saboroso, defumado artesanalmente",
        "image": "assets/imagens/salaminhos/foto8.png",
        "category": "Salaminhos"
    }
]

# Carrinho em memória (substitua por um banco de dados em produção)
cart: Dict[str, CartItem] = {}

# Endpoint para listar todos os itens do catálogo
@app.get("/items/", response_model=List[Item])
async def get_items():
    return items_db

# Endpoint para obter um item específico pelo ID
@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    for item in items_db:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item não encontrado")

# Endpoint para adicionar ou atualizar item no carrinho
@app.post("/cart/")
async def add_to_cart(item: CartItem):
    cart[item.id] = item
    return {"message": "Item adicionado ao carrinho", "cart": list(cart.values())}

# Endpoint para remover item do carrinho
@app.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str):
    if item_id in cart:
        del cart[item_id]
        return {"message": "Item removido do carrinho", "cart": list(cart.values())}
    raise HTTPException(status_code=404, detail="Item não encontrado no carrinho")

# Endpoint para obter o carrinho
@app.get("/cart/", response_model=List[CartItem])
async def get_cart():
    return list(cart.values())

# Endpoint para limpar o carrinho
@app.delete("/cart/")
async def clear_cart():
    cart.clear()
    return {"message": "Carrinho limpo"}

# Endpoint para finalizar o pedido (gera link do WhatsApp)
@app.post("/order/")
async def create_order(order: OrderRequest):
    if not order.items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")
    
    lines = ["Olá! Quero fazer um pedido:\n"]
    total = 0

    for item in order.items:
        subtotal = item.price * item.qty
        total += subtotal
        lines.append(f"- {item.name} | R$ {item.price:.2f} x {item.qty} = R$ {subtotal:.2f}")
    
    lines.append("")
    lines.append(f"*Total do pedido: R$ {total:.2f}*")
    
    message = quote("\n".join(lines))
    phone = "5537991243408"
    whatsapp_url = f"https://wa.me/{phone}?text={message}"
    
    return {"whatsapp_url": whatsapp_url}

# Endpoint para saúde da API
@app.get("/health/")
async def health_check():
    return {"status": "API is running"}