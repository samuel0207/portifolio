import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Minus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductStatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ImageInput } from '../../components/ui/ImageInput';
import type { InventoryProduct, ProductStatus } from '../../types';
import { computeProductStatus, formatCurrencyBRL } from '../../utils/format';

export const AdminInventoryPage: React.FC = () => {
  const {
    data,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustProductStock,
    toggleInterestResolved,
    deleteInterest,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'interests'>('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<'Todos' | ProductStatus>('Todos');

  // Product modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryProduct | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [showPrice, setShowPrice] = useState(true);
  const [stock, setStock] = useState(5);
  const [lowStockThreshold, setLowStockThreshold] = useState(2);
  const [status, setStatus] = useState<ProductStatus>('Disponível');
  const [visiblePublic, setVisiblePublic] = useState(true);
  const [allowReservation, setAllowReservation] = useState(true);
  const [deductStockOnReserve, setDeductStockOnReserve] = useState(true);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.products.forEach((p) => set.add(p.category));
    return ['Todas', ...Array.from(set).sort()];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.products.filter((p) => {
      if (categoryFilter !== 'Todas' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'Todos' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [data.products, search, categoryFilter, statusFilter]);

  const pendingInterestsCount = data.productInterests.filter((i) => !i.resolved).length;

  const openCreateModal = () => {
    setEditing(null);
    setName('');
    setSku(`ATL-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Equipamentos');
    setDescription('');
    setImageUrl('');
    setPriceInput('');
    setShowPrice(true);
    setStock(5);
    setLowStockThreshold(2);
    setStatus('Disponível');
    setVisiblePublic(true);
    setAllowReservation(true);
    setDeductStockOnReserve(true);
    setModalOpen(true);
  };

  const openEditModal = (prod: InventoryProduct) => {
    setEditing(prod);
    setName(prod.name);
    setSku(prod.sku);
    setCategory(prod.category);
    setDescription(prod.description);
    setImageUrl(prod.imageUrl);
    setPriceInput(prod.price !== null ? String(prod.price) : '');
    setShowPrice(prod.showPrice);
    setStock(prod.stock);
    setLowStockThreshold(prod.lowStockThreshold);
    setStatus(prod.status);
    setVisiblePublic(prod.visiblePublic);
    setAllowReservation(prod.allowReservation);
    setDeductStockOnReserve(prod.deductStockOnReserve);
    setModalOpen(true);
  };

  const handleStockInputChange = (val: number) => {
    const safe = Math.max(0, val);
    setStock(safe);
    setStatus((prev) => computeProductStatus(safe, lowStockThreshold, prev));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const normalizedPrice = priceInput.trim().replace(',', '.');
    const parsedPrice =
      normalizedPrice === '' || Number.isNaN(Number(normalizedPrice))
        ? null
        : Math.max(0, Number(normalizedPrice));

    const finalStatus =
      status === 'Oculto'
        ? 'Oculto'
        : computeProductStatus(stock, lowStockThreshold, status);

    const payload: Omit<InventoryProduct, 'id' | 'createdAt'> = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim() || 'Geral',
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      price: parsedPrice,
      showPrice,
      stock,
      lowStockThreshold,
      status: finalStatus,
      visiblePublic: finalStatus === 'Oculto' ? false : visiblePublic,
      allowReservation,
      deductStockOnReserve,
    };

    if (editing) {
      updateProduct(editing.id, payload);
      notify({ type: 'success', title: 'Produto atualizado no inventário' });
    } else {
      addProduct(payload);
      notify({ type: 'success', title: 'Produto cadastrado no inventário' });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header + Underline Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#18191c]">
              Inventário de Produtos
            </h1>
            <p className="mt-1 text-sm text-[#686c75]">
              Controle estoque em tempo real, preços, visibilidade na vitrine pública e
              solicitações.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="studio-dark-btn inline-flex items-center gap-1.5 self-start rounded-full px-4 py-2 text-xs font-semibold sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>

        <div className="flex items-center gap-6 border-b border-black/10">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`relative inline-flex items-center gap-2 pb-2.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'products' ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
            }`}
          >
            <Package className="h-4 w-4" />
            Produtos ({data.products.length})
            {activeTab === 'products' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interests')}
            className={`relative inline-flex items-center gap-2 pb-2.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'interests' ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Reservas & Interesses
            {pendingInterestsCount > 0 && (
              <span className="rounded-full bg-[#1f2024] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingInterestsCount}
              </span>
            )}
            {activeTab === 'interests' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d717a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, SKU ou categoria..."
                className="studio-input w-full rounded-xl py-2 pl-10 pr-3 text-xs outline-none sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="studio-input rounded-xl px-3 py-2 text-xs outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Categoria: {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="studio-input rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="Todos">Todos os status</option>
                <option value="Disponível">Disponível</option>
                <option value="Baixo estoque">Baixo estoque</option>
                <option value="Esgotado">Esgotado</option>
                <option value="Oculto">Oculto</option>
              </select>
            </div>
          </div>

          {/* Product rows */}
          {filteredProducts.length === 0 ? (
            <div className="studio-card rounded-[22px] py-12 text-center">
              <Package className="mx-auto h-9 w-9 text-[#72767f]" />
              <p className="mt-2 text-sm font-medium text-[#2c2f36]">
                Nenhum produto encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="studio-card flex flex-col gap-4 rounded-[20px] p-4 transition lg:flex-row lg:items-center"
                >
                  {/* Thumbnail + Info */}
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white/40">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#72767f]">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[#555962]">
                          {prod.sku}
                        </span>
                        <span className="text-[#9fa3ac]">•</span>
                        <span className="text-[11px] text-[#666a73]">{prod.category}</span>
                        <ProductStatusBadge status={prod.status} surface="studio" />
                        {!prod.visiblePublic && (
                          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-medium text-[#4a4e57]">
                            Fora da vitrine
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 truncate text-sm font-semibold text-[#18191c]">
                        {prod.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666a73]">
                        <span className="font-semibold text-[#18191c]">
                          {prod.showPrice ? formatCurrencyBRL(prod.price) : 'Preço oculto'}
                        </span>
                        <span>
                          {prod.allowReservation
                            ? prod.deductStockOnReserve
                              ? 'Reserva desconta estoque'
                              : 'Apenas sinaliza interesse'
                            : 'Reserva desativada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stock Controls + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                    {/* Quick + / - Stock */}
                    <div className="studio-subcard flex items-center gap-1 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => adjustProductStock(prod.id, -1)}
                        disabled={prod.stock <= 0}
                        className="rounded-full p-1.5 text-[#3c3f46] transition hover:bg-white/70 disabled:opacity-30"
                        title="Diminuir estoque"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[4.2rem] text-center font-mono text-xs font-semibold text-[#18191c]">
                        {prod.stock} un.
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustProductStock(prod.id, 1)}
                        className="rounded-full p-1.5 text-[#3c3f46] transition hover:bg-white/70"
                        title="Aumentar estoque"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextVisible = !prod.visiblePublic;
                          updateProduct(prod.id, {
                            visiblePublic: nextVisible,
                            status: nextVisible
                              ? computeProductStatus(prod.stock, prod.lowStockThreshold)
                              : 'Oculto',
                          });
                          notify({
                            type: 'info',
                            title: nextVisible
                              ? 'Produto exibido na vitrine pública'
                              : 'Produto ocultado da vitrine pública',
                          });
                        }}
                        className="studio-pill-btn rounded-xl p-2"
                        title={
                          prod.visiblePublic
                            ? 'Ocultar do portfólio público'
                            : 'Exibir no portfólio público'
                        }
                      >
                        {prod.visiblePublic ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-700" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-[#72767f]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="studio-pill-btn rounded-xl p-2"
                        title="Editar produto"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteProduct(prod.id);
                          notify({ type: 'info', title: 'Produto removido do inventário' });
                        }}
                        className="studio-pill-btn rounded-xl p-2 hover:text-rose-600"
                        title="Excluir produto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISITOR RESERVATIONS / INTERESTS */}
      {activeTab === 'interests' && (
        <div className="space-y-3">
          {data.productInterests.length === 0 ? (
            <div className="studio-card rounded-[22px] py-12 text-center">
              <ShoppingBag className="mx-auto h-9 w-9 text-[#72767f]" />
              <p className="mt-2 text-sm font-medium text-[#2c2f36]">
                Nenhuma reserva ou interesse registrado ainda.
              </p>
              <p className="mt-1 text-xs text-[#686c75]">
                Quando um visitante reservar um produto pelo portfólio público, o registro aparecerá
                aqui.
              </p>
            </div>
          ) : (
            data.productInterests.map((item) => (
              <div
                key={item.id}
                className={`studio-card flex flex-col gap-3 rounded-[20px] p-4 sm:flex-row sm:items-center sm:justify-between ${
                  item.resolved ? 'opacity-65' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-[#666a73]">{item.productSku}</span>
                    <span className="rounded-full bg-black/[0.08] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#18191c]">
                      Qtd: {item.quantity}
                    </span>
                    {item.deductedStock ? (
                      <span className="rounded-full border border-emerald-700/20 bg-emerald-600/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Descontado do estoque
                      </span>
                    ) : (
                      <span className="rounded-full border border-sky-700/20 bg-sky-600/12 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                        Interesse sinalizado
                      </span>
                    )}
                    {item.resolved && (
                      <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-medium text-[#555962]">
                        Concluído
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#18191c]">{item.productName}</h3>
                  <p className="text-xs text-[#555962]">
                    Visitante: <span className="font-semibold text-[#18191c]">{item.visitorName}</span>{' '}
                    • {item.visitorContact}
                  </p>
                  {item.notes && <p className="text-xs italic text-[#6d717a]">“{item.notes}”</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => toggleInterestResolved(item.id)}
                    className="studio-pill-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  >
                    {item.resolved ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reabrir
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        Marcar atendido
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteInterest(item.id);
                      notify({ type: 'info', title: 'Registro removido' });
                    }}
                    className="studio-pill-btn rounded-full p-1.5 hover:text-rose-600"
                    title="Excluir registro"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Produto' : 'Novo Produto no Inventário'}
        subtitle="Configure estoque, preço, regras de reserva e visibilidade na vitrine."
        maxWidthClass="max-w-2xl"
        surface="studio"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Kit Iluminação LED 120W"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                SKU / Código *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ATL-001"
                className="studio-input w-full rounded-xl px-3 py-2 font-mono text-sm uppercase outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Iluminação, Áudio..."
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Preço (R$, opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Ex: 1290.00"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="Disponível">Disponível</option>
                <option value="Baixo estoque">Baixo estoque</option>
                <option value="Esgotado">Esgotado</option>
                <option value="Oculto">Oculto</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => handleStockInputChange(Number(e.target.value) || 0)}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Limite para “Baixo estoque”
              </label>
              <input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(1, Number(e.target.value) || 1))}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#52565f]">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações, estado de conservação, itens inclusos..."
              className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <ImageInput
            label="Foto do Produto"
            value={imageUrl}
            onChange={setImageUrl}
            previewAspect="video"
            surface="studio"
          />

          <div className="studio-subcard grid gap-2.5 rounded-xl p-3.5 text-xs sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={visiblePublic}
                onChange={(e) => setVisiblePublic(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024]"
              />
              Exibir no portfólio público
            </label>
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024]"
              />
              Exibir preço publicamente
            </label>
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={allowReservation}
                onChange={(e) => setAllowReservation(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024]"
              />
              Permitir reserva / interesse
            </label>
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={deductStockOnReserve}
                disabled={!allowReservation}
                onChange={(e) => setDeductStockOnReserve(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024] disabled:opacity-40"
              />
              Descontar estoque ao reservar
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="studio-pill-btn rounded-full px-4 py-2 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="studio-dark-btn rounded-full px-5 py-2 text-xs font-semibold"
            >
              {editing ? 'Salvar Produto' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
