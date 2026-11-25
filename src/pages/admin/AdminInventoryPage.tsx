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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inventário de Produtos</h1>
          <p className="mt-1 text-sm text-[#8b96a6]">
            Controle estoque em tempo real, preços, visibilidade na vitrine pública e solicitações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#252d3a] bg-[#0f131a] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-[#1c222d] text-white'
                  : 'text-[#8b96a6] hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Produtos ({data.products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interests')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'interests'
                  ? 'bg-[#1c222d] text-white'
                  : 'text-[#8b96a6] hover:text-white'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Reservas & Interesses
              {pendingInterestsCount > 0 && (
                <span className="rounded-full bg-[#ef5350] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {pendingInterestsCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#ef5350]/20 transition hover:bg-[#f26461]"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, SKU ou categoria..."
                className="w-full rounded-xl border border-[#252d3a] bg-[#0b0e14] py-2 pl-9 pr-3 text-xs text-white placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs text-[#d5dce6] outline-none"
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
                className="rounded-xl border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs text-[#d5dce6] outline-none"
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
            <div className="rounded-2xl border border-dashed border-[#252d3a] bg-[#0f131a] py-12 text-center">
              <Package className="mx-auto h-9 w-9 text-[#5a6575]" />
              <p className="mt-2 text-sm font-medium text-[#d5dce6]">
                Nenhum produto encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-4 transition hover:border-[#344054] lg:flex-row lg:items-center"
                >
                  {/* Thumbnail + Info */}
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#222a36] bg-[#161b22]">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#5a6575]">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[#8b96a6]">
                          {prod.sku}
                        </span>
                        <span className="text-[#3a475c]">•</span>
                        <span className="text-[11px] text-[#9aa5b4]">{prod.category}</span>
                        <ProductStatusBadge status={prod.status} />
                        {!prod.visiblePublic && (
                          <span className="rounded-full border border-slate-600/40 bg-slate-700/20 px-2 py-0.5 text-[10px] text-slate-300">
                            Fora da vitrine
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 truncate text-sm font-semibold text-white">
                        {prod.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b96a6]">
                        <span className="font-semibold text-[#e6edf3]">
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
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#222a36] pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                    {/* Quick + / - Stock */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#252d3a] bg-[#161b22] p-1">
                      <button
                        type="button"
                        onClick={() => adjustProductStock(prod.id, -1)}
                        disabled={prod.stock <= 0}
                        className="rounded-lg p-1.5 text-[#c8d1dc] transition hover:bg-[#222a36] hover:text-white disabled:opacity-30"
                        title="Diminuir estoque"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[4.2rem] text-center font-mono text-xs font-semibold text-white">
                        {prod.stock} un.
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustProductStock(prod.id, 1)}
                        className="rounded-lg p-1.5 text-[#c8d1dc] transition hover:bg-[#222a36] hover:text-white"
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
                        className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white"
                        title={
                          prod.visiblePublic
                            ? 'Ocultar do portfólio público'
                            : 'Exibir no portfólio público'
                        }
                      >
                        {prod.visiblePublic ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white"
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
                        className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:border-[#ef5350]/50 hover:text-[#ef5350]"
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
            <div className="rounded-2xl border border-dashed border-[#252d3a] bg-[#0f131a] py-12 text-center">
              <ShoppingBag className="mx-auto h-9 w-9 text-[#5a6575]" />
              <p className="mt-2 text-sm font-medium text-[#d5dce6]">
                Nenhuma reserva ou interesse registrado ainda.
              </p>
              <p className="mt-1 text-xs text-[#8b96a6]">
                Quando um visitante reservar um produto pelo portfólio público, o registro aparecerá
                aqui.
              </p>
            </div>
          ) : (
            data.productInterests.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  item.resolved
                    ? 'border-[#222a36] bg-[#0f131a]/55 opacity-75'
                    : 'border-[#252d3a] bg-[#0f131a]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-[#8b96a6]">{item.productSku}</span>
                    <span className="rounded-md bg-[#161b22] px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                      Qtd: {item.quantity}
                    </span>
                    {item.deductedStock ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        Descontado do estoque
                      </span>
                    ) : (
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                        Interesse sinalizado
                      </span>
                    )}
                    {item.resolved && (
                      <span className="rounded-full bg-slate-600/25 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        Concluído
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.productName}</h3>
                  <p className="text-xs text-[#b4bfd0]">
                    Visitante: <span className="font-medium text-white">{item.visitorName}</span> •{' '}
                    {item.visitorContact}
                  </p>
                  {item.notes && <p className="text-xs italic text-[#8b96a6]">“{item.notes}”</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => toggleInterestResolved(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#d5dce6] hover:bg-[#1c222d]"
                  >
                    {item.resolved ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reabrir
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
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
                    className="rounded-lg border border-[#252d3a] bg-[#161b22] p-1.5 text-[#9aa5b4] hover:border-[#ef5350]/50 hover:text-[#ef5350]"
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
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#9aa5b4]">Nome do Produto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Kit Iluminação LED 120W"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">SKU / Código *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ATL-001"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 font-mono text-sm uppercase text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Iluminação, Áudio..."
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Preço (R$, opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Ex: 1290.00"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
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
              <label className="mb-1 block text-xs text-[#9aa5b4]">Quantidade em Estoque</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => handleStockInputChange(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">
                Limite para “Baixo estoque”
              </label>
              <input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#9aa5b4]">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações, estado de conservação, itens inclusos..."
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
            />
          </div>

          <ImageInput
            label="Foto do Produto"
            value={imageUrl}
            onChange={setImageUrl}
            previewAspect="video"
          />

          <div className="grid gap-2.5 rounded-xl border border-[#222a36] bg-[#161b22] p-3.5 text-xs sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={visiblePublic}
                onChange={(e) => setVisiblePublic(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350]"
              />
              Exibir no portfólio público
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350]"
              />
              Exibir preço publicamente
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={allowReservation}
                onChange={(e) => setAllowReservation(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350]"
              />
              Permitir reserva / interesse
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={deductStockOnReserve}
                disabled={!allowReservation}
                onChange={(e) => setDeductStockOnReserve(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350] disabled:opacity-40"
              />
              Descontar estoque ao reservar
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#252d3a] pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[#252d3a] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c8d1dc]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white hover:bg-[#f26461]"
            >
              {editing ? 'Salvar Produto' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
