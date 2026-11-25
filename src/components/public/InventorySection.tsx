import React, { useMemo, useState } from 'react';
import {
  Search,
  Package,
  Tag,
  ShoppingBag,
  CheckCircle2,
  Boxes,
  Info,
} from 'lucide-react';
import type { InventoryProduct } from '../../types';
import { formatCurrencyBRL } from '../../utils/format';
import { ProductStatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';

interface InventorySectionProps {
  products: InventoryProduct[];
}

export const InventorySection: React.FC<InventorySectionProps> = ({ products }) => {
  const { registerProductInterest, notify } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Interest / reservation form state
  const [quantity, setQuantity] = useState(1);
  const [visitorName, setVisitorName] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [notes, setNotes] = useState('');
  const [showReserveForm, setShowReserveForm] = useState(false);

  const publicProducts = useMemo(
    () => products.filter((p) => p.visiblePublic && p.status !== 'Oculto'),
    [products]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    publicProducts.forEach((p) => set.add(p.category));
    return ['Todas', ...Array.from(set).sort()];
  }, [publicProducts]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publicProducts.filter((p) => {
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [publicProducts, query, selectedCategory]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const closeProductModal = () => {
    setSelectedProductId(null);
    setShowReserveForm(false);
    setQuantity(1);
    setVisitorName('');
    setVisitorContact('');
    setNotes('');
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!visitorName.trim() || !visitorContact.trim()) {
      notify({
        type: 'warning',
        title: 'Dados obrigatórios',
        message: 'Informe seu nome e um contato para continuar.',
      });
      return;
    }

    const res = registerProductInterest({
      productId: selectedProduct.id,
      quantity,
      visitorName: visitorName.trim(),
      visitorContact: visitorContact.trim(),
      notes: notes.trim(),
    });

    if (!res.ok) {
      notify({ type: 'error', title: 'Não foi possível concluir', message: res.message });
      return;
    }

    notify({ type: 'success', title: 'Solicitação registrada', message: res.message });
    closeProductModal();
  };

  return (
    <section id="produtos" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#ef5350]">
            Inventário & Vitrine
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Produtos & Equipamentos Disponíveis
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[#8b96a6]">
            Consulte disponibilidade em tempo real, filtre por categoria e clique em um item para
            ver detalhes, reservar ou demonstrar interesse.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto, SKU ou categoria..."
            className="w-full rounded-xl border border-[#252d3a] bg-[#0f131a] py-2.5 pl-10 pr-4 text-sm text-[#e6edf3] placeholder-[#637083] outline-none transition focus:border-[#ef5350]/70"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-[#ef5350]/60 bg-[#ef5350]/15 text-white'
                  : 'border-[#252d3a] bg-[#0f131a] text-[#9aa5b4] hover:border-[#394558] hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#252d3a] bg-[#0f131a] px-6 py-12 text-center">
          <Package className="mx-auto h-9 w-9 text-[#5a6575]" />
          <p className="mt-3 text-sm font-medium text-[#d5dce6]">
            Nenhum produto encontrado para o filtro atual.
          </p>
          <p className="mt-1 text-xs text-[#8b96a6]">
            Tente limpar a busca ou escolher outra categoria.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProductId(product.id);
                setQuantity(1);
                setShowReserveForm(false);
              }}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#252d3a] bg-[#0f131a] transition duration-200 hover:-translate-y-0.5 hover:border-[#394558] hover:shadow-xl hover:shadow-black/40"
            >
              <div className="relative h-44 w-full overflow-hidden border-b border-[#222a36] bg-[#161b22]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#4a5568]">
                    <Package className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <ProductStatusBadge status={product.status} />
                </div>
                <span className="absolute bottom-2.5 right-3 rounded-md bg-[#0b0e14]/80 px-2 py-0.5 font-mono text-[10px] text-[#b4bfd0] backdrop-blur-sm">
                  {product.sku}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8b96a6]">
                  <Tag className="h-3 w-3 text-[#ef5350]" />
                  {product.category}
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-[#e6edf3] group-hover:text-white sm:text-base">
                  {product.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#8b96a6]">
                  {product.description}
                </p>

                <div className="mt-4 flex items-end justify-between border-t border-[#222a36] pt-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#6b7686]">
                      Valor
                    </span>
                    <span className="text-base font-bold text-white">
                      {product.showPrice ? formatCurrencyBRL(product.price) : 'Sob consulta'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-[#9aa5b4]">
                      <Boxes className="h-3.5 w-3.5 text-[#7d8898]" />
                      {product.stock > 0 ? `${product.stock} un.` : 'Sem estoque'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail & Reservation Modal */}
      <Modal
        open={Boolean(selectedProduct)}
        onClose={closeProductModal}
        title={selectedProduct?.name || ''}
        subtitle={
          selectedProduct ? `${selectedProduct.category} • SKU ${selectedProduct.sku}` : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-[#252d3a] bg-[#161b22]">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-56 w-full object-cover sm:h-full"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-[#5a6575]">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProductStatusBadge status={selectedProduct.status} />
                    <span className="rounded-full border border-[#252d3a] bg-[#161b22] px-2.5 py-0.5 font-mono text-[11px] text-[#9aa5b4]">
                      Estoque: {selectedProduct.stock} un.
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[#8b96a6]">Preço</span>
                    <p className="text-2xl font-bold text-white">
                      {selectedProduct.showPrice
                        ? formatCurrencyBRL(selectedProduct.price)
                        : 'Sob consulta'}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-[#b4bfd0]">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.allowReservation && (
                  <div className="rounded-xl border border-[#252d3a] bg-[#161b22]/80 p-3 text-xs text-[#9aa5b4]">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                      <span>
                        {selectedProduct.stock > 0 && selectedProduct.deductStockOnReserve
                          ? 'Ao reservar este item, a quantidade selecionada será reservada e descontada automaticamente do estoque.'
                          : selectedProduct.stock === 0
                            ? 'Item temporariamente esgotado. Você pode registrar interesse para ser avisado na reposição.'
                            : 'Ao clicar abaixo, seu interesse será sinalizado diretamente no painel do administrador.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProduct.allowReservation && (
              <div className="border-t border-[#252d3a] pt-4">
                {!showReserveForm ? (
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={closeProductModal}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c8d1dc] hover:bg-[#1c222d]"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReserveForm(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f26461]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {selectedProduct.stock > 0 && selectedProduct.deductStockOnReserve
                        ? 'Reservar Produto'
                        : 'Demonstrar Interesse'}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReserveSubmit}
                    className="space-y-3 rounded-xl border border-[#252d3a] bg-[#161b22] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">
                        {selectedProduct.stock > 0 && selectedProduct.deductStockOnReserve
                          ? 'Dados para Reserva'
                          : 'Registrar Interesse'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowReserveForm(false)}
                        className="text-xs text-[#8b96a6] hover:text-white"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className="mb-1 block text-[11px] text-[#8b96a6]">Quantidade</label>
                        <input
                          type="number"
                          min={1}
                          max={
                            selectedProduct.deductStockOnReserve && selectedProduct.stock > 0
                              ? selectedProduct.stock
                              : 99
                          }
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-white outline-none focus:border-[#ef5350]/70"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[11px] text-[#8b96a6]">
                          Seu nome *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nome completo"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-white placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-[#8b96a6]">
                        WhatsApp ou E-mail *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 99999-9999 ou seu@email.com"
                        value={visitorContact}
                        onChange={(e) => setVisitorContact(e.target.value)}
                        className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-white placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-[#8b96a6]">
                        Observação (opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Dúvida sobre entrega, retirada ou pagamento..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-white placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReserveForm(false)}
                        className="rounded-lg border border-[#252d3a] px-3 py-1.5 text-xs text-[#9aa5b4] hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-[#06120a] transition hover:bg-emerald-400"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
};
