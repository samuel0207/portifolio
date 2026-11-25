import React, { useMemo, useState } from 'react';
import {
  Search,
  Package,
  Tag,
  ShoppingBag,
  CheckCircle2,
  Boxes,
  Info,
  ArrowRight,
} from 'lucide-react';
import type { InventoryProduct } from '../../types';
import { formatCurrencyBRL } from '../../utils/format';
import { ProductStatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';

interface InventorySectionProps {
  products: InventoryProduct[];
  eyebrow: string;
  title: string;
  description: string;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  products,
  eyebrow,
  title,
  description,
}) => {
  const { registerProductInterest, notify } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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
    <section
      id="produtos"
      className="scroll-mt-24 border-y border-[#ebe0d4] bg-[#fbf8f4] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        {/* Header + Search */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#b96b4d] uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="font-editorial mt-1.5 text-3xl font-medium text-[#2a211d] sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-xs leading-relaxed text-[#6f6259] sm:text-sm">
                {description}
              </p>
            )}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b887b]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto, SKU ou categoria..."
              className="w-full rounded-full border border-[#e2d4c5] bg-[#f8f2eb] py-2.5 pl-10 pr-4 text-xs text-[#2a211d] placeholder-[#9b887b] outline-none transition focus:border-[#b96b4d] sm:text-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-medium tracking-[0.1em] uppercase transition ${
                  active
                    ? 'bg-[#b96b4d] text-[#fdfaf7] shadow-sm'
                    : 'border border-[#e4d6c8] bg-[#f8f2eb] text-[#6f6259] hover:border-[#b96b4d]/60 hover:text-[#2a211d]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfd0c1] bg-[#f8f2eb] px-6 py-12 text-center">
            <Package className="mx-auto h-9 w-9 text-[#b5a395]" />
            <p className="font-editorial mt-3 text-xl text-[#2a211d]">
              Nenhum produto encontrado para o filtro atual.
            </p>
            <p className="mt-1 text-xs text-[#7c6d63]">
              Tente limpar a busca ou escolher outra categoria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setQuantity(1);
                  setShowReserveForm(false);
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#ebe0d4] bg-[#f8f2eb] transition duration-300 hover:-translate-y-1 hover:border-[#d5bfa9] hover:shadow-[0_14px_34px_rgba(42,33,29,0.08)]"
              >
                <div className="relative h-52 w-full overflow-hidden bg-[#efe5da]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#b5a395]">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <ProductStatusBadge status={product.status} surface="editorial" />
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#2a211d]/75 px-2.5 py-0.5 font-mono text-[10px] text-[#f8f2eb] backdrop-blur-sm">
                    {product.sku}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#b96b4d] uppercase">
                    <Tag className="h-3 w-3" />
                    {product.category}
                  </div>

                  <h3 className="font-editorial mt-1.5 line-clamp-2 text-xl font-semibold leading-snug text-[#2a211d] group-hover:text-[#b96b4d]">
                    {product.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#6f6259]">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-end justify-between border-t border-[#e8ddd0] pt-3.5">
                    <div>
                      <span className="block text-[9px] font-semibold tracking-[0.16em] text-[#9b887b] uppercase">
                        Valor
                      </span>
                      <span className="font-editorial text-xl font-semibold text-[#2a211d]">
                        {product.showPrice ? formatCurrencyBRL(product.price) : 'Sob consulta'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#6f6259]">
                        <Boxes className="h-3.5 w-3.5 text-[#b96b4d]" />
                        {product.stock > 0 ? `${product.stock} un.` : 'Sem estoque'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.14em] text-[#b96b4d] uppercase">
                        Detalhes
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editorial Product Detail & Reservation Modal */}
      <Modal
        open={Boolean(selectedProduct)}
        onClose={closeProductModal}
        title={selectedProduct?.name || ''}
        subtitle={
          selectedProduct ? `${selectedProduct.category} • SKU ${selectedProduct.sku}` : undefined
        }
        maxWidthClass="max-w-3xl"
        surface="editorial"
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="grid items-start gap-5 sm:grid-cols-2">
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-[#e5d8ca] bg-[#efe5da]/75 p-2 sm:p-3">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="max-h-[46dvh] w-auto max-w-full rounded-lg object-contain sm:max-h-[420px]"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-[#b5a395]">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProductStatusBadge status={selectedProduct.status} surface="editorial" />
                    <span className="rounded-full border border-[#e5d8ca] bg-[#f5eee6] px-2.5 py-0.5 font-mono text-[11px] text-[#6f6259]">
                      Estoque: {selectedProduct.stock} un.
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.16em] text-[#9b887b] uppercase">
                      Preço
                    </span>
                    <p className="font-editorial text-3xl font-semibold text-[#2a211d]">
                      {selectedProduct.showPrice
                        ? formatCurrencyBRL(selectedProduct.price)
                        : 'Sob consulta'}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-[#5c4f47]">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.allowReservation && (
                  <div className="rounded-xl border border-[#e5d8ca] bg-[#f5eee6] p-3 text-xs text-[#6f6259]">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#b96b4d]" />
                      <span>
                        {selectedProduct.stock > 0 && selectedProduct.deductStockOnReserve
                          ? 'Ao reservar este item, a quantidade selecionada será reservada e descontada automaticamente do estoque.'
                          : selectedProduct.stock === 0
                            ? 'Item temporariamente esgotado. Você pode registrar interesse para ser avisado na reposição.'
                            : 'Ao clicar abaixo, seu interesse será enviado diretamente para nossa equipe.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProduct.allowReservation && (
              <div className="border-t border-[#e8ddd1] pt-4">
                {!showReserveForm ? (
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={closeProductModal}
                      className="rounded-[4px] border border-[#dfd0c1] bg-[#f5eee6] px-4 py-2 text-xs font-medium text-[#5c4f47] hover:bg-[#ece0d3]"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReserveForm(true)}
                      className="inline-flex items-center gap-2 rounded-[4px] bg-[#b96b4d] px-5 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-[#9f573b]"
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
                    className="space-y-3 rounded-xl border border-[#e5d8ca] bg-[#f5eee6] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-[0.1em] text-[#2a211d] uppercase">
                        {selectedProduct.stock > 0 && selectedProduct.deductStockOnReserve
                          ? 'Dados para Reserva'
                          : 'Registrar Interesse'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowReserveForm(false)}
                        className="text-xs text-[#7c6d63] hover:text-[#2a211d]"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className="mb-1 block text-[11px] font-medium text-[#6f6259]">
                          Quantidade
                        </label>
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
                          className="w-full rounded-lg border border-[#dfd0c1] bg-white px-3 py-2 text-xs text-[#2a211d] outline-none focus:border-[#b96b4d]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[11px] font-medium text-[#6f6259]">
                          Seu nome *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nome completo"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full rounded-lg border border-[#dfd0c1] bg-white px-3 py-2 text-xs text-[#2a211d] placeholder-[#9b887b] outline-none focus:border-[#b96b4d]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#6f6259]">
                        WhatsApp ou E-mail *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 99999-9999 ou seu@email.com"
                        value={visitorContact}
                        onChange={(e) => setVisitorContact(e.target.value)}
                        className="w-full rounded-lg border border-[#dfd0c1] bg-white px-3 py-2 text-xs text-[#2a211d] placeholder-[#9b887b] outline-none focus:border-[#b96b4d]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#6f6259]">
                        Observação (opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Dúvida sobre entrega, retirada ou pagamento..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#dfd0c1] bg-white px-3 py-2 text-xs text-[#2a211d] placeholder-[#9b887b] outline-none focus:border-[#b96b4d]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReserveForm(false)}
                        className="rounded-[4px] border border-[#dfd0c1] bg-white px-3 py-1.5 text-xs text-[#6f6259] hover:text-[#2a211d]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#b96b4d] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#9f573b]"
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
