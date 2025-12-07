import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Sparkles, Truck, Clock, DollarSign, Gift, Crown, List, Type } from 'lucide-react';
import { Vendor, Post, Driver, Order } from '../types';
import { MenuItem } from '../types';

interface VendorDashboardProps {
    vendor: Vendor;
    onUpdateVendor: (updates: Partial<Vendor>) => void;
    onAddPost: (post: Post) => void;
    drivers?: Driver[];
    orders?: Order[];
    onAssignDriver?: (orderId: string, driverId: string, fee?: number) => void;
}

// Inline AssignPanel component to handle per-driver multi-order selection
const AssignPanel: React.FC<{
    driver: Driver;
    vendor: Vendor;
    orders: Order[];
    onAssignDriver?: (orderId: string, driverId: string, fee?: number) => void;
}> = ({ driver, vendor, orders, onAssignDriver }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);

    const available = orders.filter(o => o.vendorId === vendor.id && o.type === 'DELIVERY' && !o.driverId && ['PENDING', 'PREPARING', 'READY'].includes(o.status));

    // include pending/preparing/ready orders for display; some may already be assigned by another concurrent action
    const displayOrders = orders.filter(o => o.vendorId === vendor.id && o.type === 'DELIVERY' && ['PENDING', 'PREPARING', 'READY', 'AWAITING_ACCEPTANCE'].includes(o.status));

    const toggleSelect = (id: string) => {
        const order = orders.find(x => x.id === id);
        if (!order || order.driverId) return; // don't allow selecting already-assigned orders
        if (order.pendingDriverId && order.pendingDriverId !== driver.id) return; // don't select orders pending for someone else
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const [assignMessage, setAssignMessage] = useState('');

    const confirmAssign = () => {
        const toAssign = selected.filter(id => {
            const o = orders.find(x => x.id === id);
            return !!o && !o.driverId; // only assign if still unassigned
        });
        if (toAssign.length === 0) { alert('Select one or more unassigned orders to assign'); return; }
        if (!onAssignDriver) { alert('Assignment handler not provided'); return; }
        toAssign.forEach(id => onAssignDriver(id, driver.id, driver.deliveryFee ?? vendor.deliveryFee));
        setSelected([]);
        setOpen(false);
        const msg = `Assigned ${toAssign.length} order${toAssign.length > 1 ? 's' : ''} to ${driver.name}`;
        setAssignMessage(msg);
        setTimeout(() => setAssignMessage(''), 4000);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} className="bg-brand-orange text-white px-3 py-1 rounded text-xs font-bold">Assign</button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-3 z-40">
                    <div className="text-xs font-bold mb-2">Select Orders</div>
                    {displayOrders.length === 0 && <div className="text-xs text-gray-400">No pending delivery orders</div>}
                    <div className="max-h-40 overflow-auto space-y-2 mb-3">
                        {displayOrders.map(o => {
                            const isAssigned = !!o.driverId;
                            const isPending = !!o.pendingDriverId;
                            const isPendingToThisDriver = o.pendingDriverId === driver.id;
                            const disabled = isAssigned || (isPending && !isPendingToThisDriver);
                            return (
                                <label key={o.id} className={`flex items-center justify-between p-2 rounded ${disabled ? 'bg-gray-100 opacity-70' : 'bg-gray-50'}`}>
                                    <div className="text-xs">
                                        <div className="font-bold">#{o.id.slice(-6)}</div>
                                        <div className="text-[11px] text-gray-500">${o.total.toFixed(2)} • {new Date(o.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isAssigned && <span className="text-[10px] text-gray-500 italic">Assigned</span>}
                                        {!isAssigned && isPending && isPendingToThisDriver && <span className="text-[10px] text-yellow-600 italic">Pending</span>}
                                        {!isAssigned && isPending && !isPendingToThisDriver && <span className="text-[10px] text-gray-500 italic">Pending</span>}
                                        <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSelect(o.id)} disabled={disabled} />
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    {assignMessage && <div className="text-sm text-green-600 mb-2">{assignMessage}</div>}
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setOpen(false); setSelected([]); }} className="px-3 py-1 text-xs bg-gray-100 rounded">Cancel</button>
                        <button onClick={confirmAssign} className="px-3 py-1 text-xs bg-brand-dark text-white rounded">Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, onUpdateVendor, onAddPost, drivers = [], orders = [], onAssignDriver }) => {
    // Catalog management state
    const [catalog, setCatalog] = useState<MenuItem[]>(vendor.menu || []);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [catalogForm, setCatalogForm] = useState<Partial<MenuItem>>({ name: '', description: '', price: 0, image: '', ingredients: [], available: true });
    const [catalogImagePreview, setCatalogImagePreview] = useState<string>('');
    // Sync local catalog with vendor prop
    useEffect(() => { setCatalog(vendor.menu || []); }, [vendor.menu]);

    // Handle catalog form changes
    const handleCatalogFormChange = (field: keyof MenuItem, value: any) => {
        setCatalogForm(prev => ({ ...prev, [field]: value }));
    };

    // Handle catalog image upload
    const handleCatalogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCatalogImagePreview(reader.result as string);
                setCatalogForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Add or update product in catalog
    const handleSaveCatalogItem = () => {
        if (!catalogForm.name || !catalogForm.price || !catalogForm.image) return;
        if (editingItem) {
            // Update existing
            const updated = catalog.map(item => item.id === editingItem.id ? { ...editingItem, ...catalogForm, price: Number(catalogForm.price), ingredients: (catalogForm.ingredients || '').toString().split(',').map(s => s.trim()) } : item);
            setCatalog(updated);
            onUpdateVendor({ menu: updated });
        } else {
            // Add new
            const newItem: MenuItem = {
                id: 'm-' + Date.now(),
                vendorId: vendor.id,
                name: catalogForm.name!,
                description: catalogForm.description || '',
                price: Number(catalogForm.price),
                image: catalogForm.image!,
                ingredients: (catalogForm.ingredients || '').toString().split(',').map(s => s.trim()),
                available: true
            };
            const updated = [newItem, ...catalog];
            setCatalog(updated);
            onUpdateVendor({ menu: updated });
        }
        setEditingItem(null);
        setCatalogForm({ name: '', description: '', price: 0, image: '', ingredients: [], available: true });
        setCatalogImagePreview('');
    };

    // Edit product
    const handleEditCatalogItem = (item: MenuItem) => {
        setEditingItem(item);
        setCatalogForm({ ...item, ingredients: item.ingredients.join(', ') });
        setCatalogImagePreview(item.image);
    };

    // Remove product
    const handleRemoveCatalogItem = (id: string) => {
        const updated = catalog.filter(item => item.id !== id);
        setCatalog(updated);
        onUpdateVendor({ menu: updated });
        if (editingItem && editingItem.id === id) {
            setEditingItem(null);
            setCatalogForm({ name: '', description: '', price: 0, image: '', ingredients: [], available: true });
            setCatalogImagePreview('');
        }
    };
    const [isGenerating, setIsGenerating] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [croppedImage, setCroppedImage] = useState<string>('');
    const [cropAspect, setCropAspect] = useState<'square' | '4:3' | '16:9'>('square');
    const [cropScale, setCropScale] = useState<number>(1);

    // New state for flexible list details
    const [detailHeader, setDetailHeader] = useState('');
    const [detailList, setDetailList] = useState('');

    const handleGenerateCaption = async () => {
        // Allow caption generation even if vendor only uploaded an image
        if (!newItemName && !imagePreview) return;
        // AI Disabled
        alert("AI Caption generation is currently disabled.");
    };

    // Apply a centered crop using selected aspect and scale
    const applyCrop = () => {
        if (!imagePreview) return;
        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            let aspect = 1;
            if (cropAspect === '4:3') aspect = 4 / 3;
            if (cropAspect === '16:9') aspect = 16 / 9;

            // Determine max crop size that fits in image
            let maxCropW = iw;
            let maxCropH = ih;
            if (iw / ih > aspect) {
                maxCropW = Math.floor(ih * aspect);
                maxCropH = ih;
            } else {
                maxCropW = iw;
                maxCropH = Math.floor(iw / aspect);
            }

            // Apply zoom (scale >1 -> smaller crop)
            const cropW = Math.max(1, Math.floor(maxCropW / cropScale));
            const cropH = Math.max(1, Math.floor(maxCropH / cropScale));

            const sx = Math.max(0, Math.floor((iw - cropW) / 2));
            const sy = Math.max(0, Math.floor((ih - cropH) / 2));

            // Output size (keep reasonable width)
            const outW = Math.min(1200, cropW);
            const outH = Math.floor(outW * (cropH / cropW));

            const canvas = document.createElement('canvas');
            canvas.width = outW;
            canvas.height = outH;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCroppedImage(dataUrl);
        };
    };

    const resetCrop = () => {
        setCroppedImage(imagePreview);
        setCropScale(1);
    };

    const handlePost = () => {
        if (!(newItemName || croppedImage || imagePreview)) return;

        const newPost: Post = {
            id: 'post-' + Date.now(),
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorAvatar: vendor.avatar,
            image: croppedImage || imagePreview || 'https://via.placeholder.com/600',
            caption: generatedCaption || newItemName,
            likes: 0,
            shares: 0,
            purchaseCount: 0,
            rating: 0,
            timestamp: Date.now(),
            ingredients: detailList ? detailList.split(',').map(s => s.trim()) : []
        };

        onAddPost(newPost);

        // Reset form
        setNewItemName('');
        setGeneratedCaption('');
        setDetailList('');
        setDetailHeader('');
        setImageFile(null);
        setImagePreview('');
        setCroppedImage('');
        alert('Posted to Feed!');
    };

    return (
        <div className="pb-24 p-3 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-end mb-1">
                <div>
                    <h1 className="text-xl font-bold text-brand-dark">Dashboard</h1>
                    <p className="text-gray-500 text-xs">Welcome back, {vendor.name}!</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Balance</p>
                    <p className="text-lg font-bold text-green-600">${(vendor.walletBalance || 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Delivery Settings Card */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs text-gray-700 flex items-center">
                        <Truck size={14} className="mr-1.5 text-brand-orange" /> Delivery Settings
                    </h3>
                    <div className="flex items-center">
                        <span className={`text-[10px] font-bold mr-2 ${vendor.deliveryEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {vendor.deliveryEnabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                        <button
                            onClick={() => onUpdateVendor({ deliveryEnabled: !vendor.deliveryEnabled })}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${vendor.deliveryEnabled ? 'bg-brand-orange' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${vendor.deliveryEnabled ? 'translate-x-5' : ''}`}></div>
                        </button>
                    </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 transition-opacity ${vendor.deliveryEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5 flex items-center"><DollarSign size={10} className="mr-1" /> Fee</p>
                        <p className="font-bold text-brand-dark text-sm">${vendor.deliveryFee.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5 flex items-center"><Clock size={10} className="mr-1" /> Est. Time</p>
                        <p className="font-bold text-brand-dark text-sm">{vendor.minDeliveryTime}-{vendor.maxDeliveryTime} min</p>
                    </div>
                </div>
            </div>

            {/* Available Drivers & Assignment */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mt-3">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs text-gray-700 flex items-center">
                        <Truck size={14} className="mr-1.5 text-brand-orange" /> Available Riders
                    </h3>
                    <p className="text-[10px] text-gray-400">Assign a driver to a delivery order</p>
                </div>

                {/* Removed global order select - selection happens per-driver in Assign panel */}

                <div className="space-y-2">
                    {drivers.filter(d => d.isOnline).length === 0 && (
                        <div className="text-xs text-gray-400 italic">No riders are online right now.</div>
                    )}
                    {drivers.filter(d => d.isOnline).map(driver => (
                        <div key={driver.id} className="flex flex-col gap-2 border p-2 rounded">
                            <div className="flex items-center gap-3">
                                <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-sm">{driver.name}</div>
                                    <div className="text-[11px] text-gray-500">Fee: ${((driver.deliveryFee ?? vendor.deliveryFee) || 0).toFixed(2)} • {driver.minDeliveryTime ?? vendor.minDeliveryTime}-{driver.maxDeliveryTime ?? vendor.maxDeliveryTime} min</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <AssignPanel
                                    driver={driver}
                                    vendor={vendor}
                                    orders={orders}
                                    onAssignDriver={onAssignDriver}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Catalog Management */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs text-gray-700">Manage Catalog</h3>
                </div>
                {/* Catalog Form */}
                <div className="space-y-2 mb-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <input type="text" placeholder="Product Name" value={catalogForm.name as string} onChange={e => handleCatalogFormChange('name', e.target.value)} className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-orange mb-2 font-bold text-gray-800" />
                            <textarea placeholder="Description" value={catalogForm.description as string} onChange={e => handleCatalogFormChange('description', e.target.value)} className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-orange mb-2 text-gray-800" />
                            <input type="number" placeholder="Price" value={catalogForm.price as number} onChange={e => handleCatalogFormChange('price', e.target.value)} className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-orange mb-2 text-gray-800" min={0} step={0.01} />
                            <input type="text" placeholder="Ingredients (comma separated)" value={catalogForm.ingredients as string} onChange={e => handleCatalogFormChange('ingredients', e.target.value)} className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-orange mb-2 text-gray-800" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <input type="file" accept="image/*" id="catalog-image-input" className="hidden" onChange={handleCatalogImageUpload} />
                            <label htmlFor="catalog-image-input" className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
                                {catalogImagePreview ? <img src={catalogImagePreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Upload Photo</span>}
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleSaveCatalogItem} className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-orange-600 transition-all">{editingItem ? 'Update' : 'Add'} Product</button>
                        {editingItem && <button onClick={() => { setEditingItem(null); setCatalogForm({ name: '', description: '', price: 0, image: '', ingredients: [], available: true }); setCatalogImagePreview(''); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs">Cancel</button>}
                    </div>
                </div>
                {/* Catalog List */}
                <div className="divide-y divide-gray-100">
                    {catalog.length === 0 && <p className="text-xs text-gray-400 italic">No products yet.</p>}
                    {catalog.map(item => (
                        <div key={item.id} className="flex items-center gap-3 py-2">
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-brand-dark truncate">{item.name}</span>
                                    <span className="text-xs text-gray-400">${item.price.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{item.description}</div>
                                <div className="text-[10px] text-gray-400">{item.ingredients.join(', ')}</div>
                            </div>
                            <button onClick={() => handleEditCatalogItem(item)} className="text-xs text-blue-600 font-bold px-2">Edit</button>
                            <button onClick={() => handleRemoveCatalogItem(item.id)} className="text-xs text-red-500 font-bold px-2">Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs text-gray-700">New Post</h3>
                    <span className="text-[9px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-full font-bold">AI ASSISTED</span>
                </div>

                <div className="space-y-2.5">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex flex-col items-center justify-center text-gray-400 hover:border-brand-orange hover:bg-orange-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            id="post-image-input"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const data = ev.target?.result as string || '';
                                        setImagePreview(data);
                                        setCroppedImage(data);
                                        setCropScale(1);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />

                        {imagePreview ? (
                            <div className="w-full h-full rounded-xl overflow-hidden">
                                <img src={croppedImage || imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <label htmlFor="post-image-input" className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer">
                                <ImageIcon size={20} className="mb-1.5" />
                                <span className="text-[10px] font-medium">Upload Photo</span>
                            </label>
                        )}

                        {imagePreview && (
                            <button
                                onClick={() => {
                                    setImageFile(null);
                                    setImagePreview('');
                                    setCroppedImage('');
                                    const inp = document.getElementById('post-image-input') as HTMLInputElement | null;
                                    if (inp) inp.value = '';
                                }}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600"
                                title="Remove image"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Cropping Controls */}
                    {imagePreview && (
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <label className="font-bold">Aspect</label>
                                <select value={cropAspect} onChange={(e) => setCropAspect(e.target.value as any)} className="text-xs p-1 border rounded">
                                    <option value="square">Square</option>
                                    <option value="4:3">4:3</option>
                                    <option value="16:9">16:9</option>
                                </select>
                                <label className="font-bold ml-3">Zoom</label>
                                <input type="range" min="1" max="3" step="0.1" value={cropScale} onChange={(e) => setCropScale(parseFloat(e.target.value))} />
                                <button onClick={() => applyCrop()} className="ml-auto bg-brand-orange text-white px-3 py-1 rounded text-xs">Crop</button>
                                <button onClick={() => resetCrop()} className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Reset</button>
                            </div>
                        </div>
                    )}

                    {/* Item Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="What are you posting?"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-orange mb-2 font-bold text-gray-800"
                        />

                        {/* Flexible List Details */}
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center">
                                <List size={10} className="mr-1" /> Post Details (Optional)
                            </p>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Type size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Header (e.g., Ingredients, Specs)"
                                        value={detailHeader}
                                        onChange={(e) => setDetailHeader(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-7 pr-2 text-xs focus:outline-none focus:border-brand-orange"
                                    />
                                </div>
                                <textarea
                                    placeholder="List items separated by commas..."
                                    value={detailList}
                                    onChange={(e) => setDetailList(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange resize-none"
                                />
                            </div>
                        </div>

                        {/* Caption Generation */}
                        <div className="relative">
                            <textarea
                                className="w-full bg-gray-50 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-orange"
                                rows={2}
                                placeholder="Write a caption..."
                                value={generatedCaption}
                                onChange={(e) => setGeneratedCaption(e.target.value)}
                            />
                            <button
                                onClick={handleGenerateCaption}
                                disabled={!(newItemName || imagePreview) || isGenerating}
                                className="absolute bottom-1.5 right-1.5 bg-white shadow-sm border border-gray-200 p-1 rounded-lg text-brand-orange hover:bg-orange-50 disabled:opacity-50"
                                title="Generate with AI"
                            >
                                {isGenerating ? <div className="w-3 h-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /> : <Sparkles size={14} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePost}
                        disabled={!(newItemName || croppedImage || imagePreview)}
                        className="w-full bg-brand-dark text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 disabled:opacity-50"
                    >
                        Post to Feed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;