"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// 🔐 Authorized Admin Emails List
const ALLOWED_ADMIN_EMAILS = [
  "vishistagrahari379@gmail.com",
];

export default function AdminDashboard() {
  // Auth & Access Gate State
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Login Form States
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Tab & Data States
  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "coupons" | "banners">("catalog");
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pOriginalPrice, setPOriginalPrice] = useState("");
  const [pStock, setPStock] = useState("10");
  const [pCategory, setPCategory] = useState("Necklaces");
  const [pImage, setPImage] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [cCode, setCCode] = useState("");
  const [cDiscount, setCDiscount] = useState("");
  const [cMinOrder, setCMinOrder] = useState("");
  const [cType, setCType] = useState<"percent" | "flat">("percent");
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Banner Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bDescription, setBDescription] = useState("");
  const [bTag, setBTag] = useState("Festive Special");
  const [bCategoryTarget, setBCategoryTarget] = useState("Necklaces");
  const [bImageUrl, setBImageUrl] = useState("");
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Tracking AWB State
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<any>(null);
  const [awbInput, setAwbInput] = useState("");

  // 1. Check Authentication & Whitelist Verification on Load
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    setAuthChecking(true);
    setLoginError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user && user.email) {
        setCurrentUserEmail(user.email);
        const lowerEmail = user.email.toLowerCase().trim();
        const isAuthorized = ALLOWED_ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === lowerEmail);

        if (isAuthorized) {
          setIsAdmin(true);
          await fetchData();
        } else {
          setIsAdmin(false);
          setLoginError(`Access Denied: ${user.email} is not authorized as an Admin.`);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setIsAdmin(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    const isAuthorized = ALLOWED_ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === cleanEmail);

    if (!isAuthorized) {
      setLoginError("This email is not authorized for Admin access.");
      setIsLoggingIn(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: passwordInput,
      });

      if (error) {
        setLoginError(error.message || "Invalid Email or Password");
      } else if (data?.user) {
        setCurrentUserEmail(data.user.email || cleanEmail);
        setIsAdmin(true);
        await fetchData();
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setCurrentUserEmail(null);
    setEmailInput("");
    setPasswordInput("");
  };

  // 2. Fetch Admin Data
  const fetchData = async () => {
    setLoading(true);
    setIsSyncing(true);
    try {
      const { data: oData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (oData) setOrders(oData);

      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      if (pData) setProducts(pData);

      const { data: cData } = await supabase
        .from("coupons")
        .select("*")
        .order("id", { ascending: false });
      if (cData) setCoupons(cData);

      const { data: bData } = await supabase
        .from("banners")
        .select("*")
        .order("id", { ascending: false });
      if (bData) setBanners(bData);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setPImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setBImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenProductModal = (prod: any = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name || prod.title || "");
      setPPrice(prod.price?.toString() || "");
      setPOriginalPrice((prod.mrp || prod.original_price || prod.price)?.toString() || "");
      setPStock((prod.stock ?? (prod.in_stock ? 10 : 0)).toString());
      setPCategory(prod.category || "Necklaces");
      setPImage(prod.image_url || prod.image || "");
      setPDescription(prod.description || "");
    } else {
      setEditingProduct(null);
      setPName("");
      setPPrice("");
      setPOriginalPrice("");
      setPStock("10");
      setPCategory("Necklaces");
      setPImage("");
      setPDescription("");
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice) {
      alert("Please fill Product Name and Price");
      return;
    }

    setIsSavingProduct(true);
    const stockVal = Number(pStock) || 0;
    const isAvail = stockVal > 0;
    const defaultImg = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80";
    const finalImage = pImage.trim() || defaultImg;
    const priceNum = Number(pPrice) || 0;
    const mrpNum = Number(pOriginalPrice) || priceNum;

    const payload = {
      name: pName.trim(),
      title: pName.trim(),
      price: priceNum,
      mrp: mrpNum,
      original_price: mrpNum,
      stock: stockVal,
      in_stock: isAvail,
      is_in_stock: isAvail,
      category: pCategory || "Necklaces",
      image: finalImage,
      image_url: finalImage,
      description: pDescription.trim(),
    };

    try {
      if (editingProduct?.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
        setIsProductModalOpen(false);

        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) {
          alert("Update error: " + error.message);
          fetchData();
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([payload])
          .select();

        if (error) {
          alert("Database insert failed: " + error.message);
        } else if (data && data[0]) {
          setProducts((prev) => [data[0], ...prev]);
          setIsProductModalOpen(false);
        } else {
          fetchData();
          setIsProductModalOpen(false);
        }
      }
    } catch (err: any) {
      alert("Error saving product: " + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleStockStatus = async (prod: any) => {
    const isCurrentlyIn =
      prod.in_stock === true ||
      prod.is_in_stock === true ||
      (Number(prod.stock) > 0);

    const newStock = isCurrentlyIn ? 0 : 10;
    const newInStock = !isCurrentlyIn;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id
          ? {
              ...p,
              stock: newStock,
              in_stock: newInStock,
              is_in_stock: newInStock,
            }
          : p
      )
    );

    await supabase
      .from("products")
      .update({
        stock: newStock,
        in_stock: newInStock,
        is_in_stock: newInStock,
      })
      .eq("id", prod.id);
  };

  const handleDeleteProduct = async (id: any) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  const generateRandomCouponCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "TROV";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCCode(code);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = cCode.trim().toUpperCase();
    const discountVal = Number(cDiscount);

    if (!cleanCode || !discountVal) return;

    setIsSavingCoupon(true);
    const isPercent = cType === "percent";
    const payload: any = {
      code: cleanCode,
      discount_type: isPercent ? "percentage" : "fixed",
      discount_value: discountVal,
      discount_percent: isPercent ? discountVal : null,
      discount_amount: !isPercent ? discountVal : null,
      discount: discountVal,
      min_order_amount: Number(cMinOrder) || 0,
      min_order_value: Number(cMinOrder) || 0,
      is_active: true,
    };

    try {
      const { data, error } = await supabase
        .from("coupons")
        .insert([payload])
        .select();

      if (error) {
        alert("Coupon creation failed: " + error.message);
      } else if (data && data[0]) {
        setCoupons((prev) => [data[0], ...prev]);
        setIsCouponModalOpen(false);
        setCCode("");
        setCDiscount("");
        setCMinOrder("");
      } else {
        await fetchData();
        setIsCouponModalOpen(false);
      }
    } catch (err: any) {
      alert("Error saving coupon: " + err.message);
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: any) => {
    if (!confirm("Delete this coupon?")) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("coupons").delete().eq("id", id);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bImageUrl.trim()) {
      alert("Please provide a Title and Image URL for the banner.");
      return;
    }

    setIsSavingBanner(true);
    const payload = {
      title: bTitle.trim(),
      subtitle: bSubtitle.trim(),
      description: bDescription.trim(),
      tag: bTag.trim(),
      category_target: bCategoryTarget,
      image_url: bImageUrl.trim(),
      is_active: true
    };

    try {
      const { data, error } = await supabase.from("banners").insert([payload]).select();
      if (error) {
        alert("Banner creation failed: " + error.message);
      } else if (data && data[0]) {
        setBanners((prev) => [data[0], ...prev]);
        setIsBannerModalOpen(false);
        setBTitle("");
        setBSubtitle("");
        setBDescription("");
        setBImageUrl("");
      } else {
        fetchData();
        setIsBannerModalOpen(false);
      }
    } catch (err: any) {
      alert("Error saving banner: " + err.message);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: any) => {
    if (!confirm("Delete this banner?")) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("banners").delete().eq("id", id);
  };

  const updateOrderStatus = async (orderId: any, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await supabase.from("orders").update({ status }).eq("id", orderId);
  };

  const saveTrackingAwb = async (orderId: any) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, tracking_awb: awbInput } : o)));
    setEditingAwbOrderId(null);
    await supabase.from("orders").update({ tracking_awb: awbInput }).eq("id", orderId);
    setAwbInput("");
  };

  // Metrics & Low Stock Calculations
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || Number(o.total) || 0), 0);
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const deliveredSales = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || Number(o.total) || 0), 0);
  const pendingOrders = orders.filter((o) => !["Delivered", "Cancelled", "Return Requested", "Returned"].includes(o.status));
  const avgOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  // Out of Stock & Low Stock Count
  const outOfStockProducts = products.filter(p => p.in_stock === false || p.is_in_stock === false || Number(p.stock) === 0);
  const lowStockProducts = products.filter(p => {
    const isOut = p.in_stock === false || p.is_in_stock === false || Number(p.stock) === 0;
    return !isOut && Number(p.stock || 10) <= 2;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      orderFilter === "All" || order.status?.toLowerCase() === orderFilter.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.phone?.toLowerCase().includes(searchLower) ||
      order.customer_phone?.toLowerCase().includes(searchLower) ||
      order.id?.toString().includes(searchLower) ||
      order.address?.toLowerCase().includes(searchLower) ||
      order.shipping_address?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#a07e56] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm tracking-widest text-gray-400">VERIFYING ADMIN ACCESS...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif tracking-widest uppercase font-bold text-white">
              TROVELLA<span className="text-[#a07e56]">.</span>
            </h1>
            <p className="text-xs font-mono tracking-widest text-[#a07e56] uppercase mt-1 font-semibold">
              RESTRICTED ADMIN PORTAL
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4 leading-relaxed">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@trovella.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#a07e56]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#a07e56]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#a07e56] hover:bg-[#8b6c47] text-white font-semibold rounded-xl text-sm transition shadow-lg disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoggingIn ? "Authenticating..." : "Unlock Admin Dashboard 🔐"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-white transition">
              ← Return to Main Store
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] pb-24 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif tracking-wider uppercase font-bold text-gray-900">
                TROVELLA<span className="text-[#a07e56]">.</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase -mt-0.5 font-bold">
                ADMIN MASTER DASHBOARD
              </p>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={fetchData}
                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                {isSyncing ? "..." : "↻"}
              </button>
              <a
                href="/"
                className="px-2.5 py-1 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Store
              </a>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 sm:gap-3 text-xs sm:text-sm w-full md:w-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs truncate max-w-[200px] sm:max-w-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
              <span className="truncate">{currentUserEmail}</span>
            </span>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={fetchData}
                className="px-3 py-1.5 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
              >
                {isSyncing ? "Refreshing..." : "Refresh ↻"}
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Store ↗
              </a>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* Low Stock & Out of Stock Alert Banner */}
        {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
          <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Inventory Alert Notice</h4>
                <p className="text-xs text-white/90">
                  {outOfStockProducts.length} product(s) are Out of Stock and {lowStockProducts.length} product(s) are running Low on Stock.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("catalog")}
              className="bg-white text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow hover:bg-gray-100 transition shrink-0 cursor-pointer"
            >
              Manage Catalog ➔
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition border cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#18181b] text-white border-[#18181b] shadow"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>🛍️</span> Orders & Sales ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition border cursor-pointer ${
              activeTab === "catalog"
                ? "bg-[#18181b] text-white border-[#18181b] shadow"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>💍</span> Catalog & Stock ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition border cursor-pointer ${
              activeTab === "coupons"
                ? "bg-[#18181b] text-white border-[#18181b] shadow"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>🏷️</span> Coupons ({coupons.length})
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition border cursor-pointer ${
              activeTab === "banners"
                ? "bg-[#18181b] text-white border-[#18181b] shadow"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>🖼️</span> Hero Banners ({banners.length})
          </button>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-gray-500 uppercase">TOTAL SALES</span>
            <div className="text-xl sm:text-3xl font-bold font-serif mt-1 text-gray-900">
              ₹{totalSales.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-600 font-medium mt-1">
              ₹{deliveredSales.toLocaleString("en-IN")} delivered
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-gray-500 uppercase">TOTAL ORDERS</span>
            <div className="text-xl sm:text-3xl font-bold font-serif mt-1 text-gray-900">
              {orders.length}
            </div>
            <p className="text-[11px] sm:text-xs text-amber-600 font-medium mt-1">
              {pendingOrders.length} need action
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-gray-500 uppercase">AVERAGE ORDER (AOV)</span>
            <div className="text-xl sm:text-3xl font-bold font-serif mt-1 text-gray-900">
              ₹{avgOrderValue.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Per customer checkout</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-gray-500 uppercase">HERO BANNERS</span>
            <div className="text-xl sm:text-3xl font-bold font-serif mt-1 text-gray-900">
              {banners.length}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Live slider slides</p>
          </div>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Return Requested"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
                      orderFilter === st
                        ? "bg-[#18181b] text-white border-[#18181b]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search name, phone, order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-400 font-medium">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                No orders found under this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          #{order.id.toString().slice(0, 8)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {order.payment_method || "Online"}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-gray-900">
                        {order.customer_name || "Customer"} ·{" "}
                        <span className="text-gray-600 font-normal">{order.phone || order.customer_phone || "No phone"}</span>
                      </div>

                      <div className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                        {order.address 
                          ? `${order.address}${order.city ? `, ${order.city}` : ""}${order.pincode ? ` - ${order.pincode}` : ""}` 
                          : (order.shipping_address || "No address provided")}
                      </div>

                      {order.cancellation_reason && (
                        <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-xs text-red-800">
                          <strong>Cancellation Reason:</strong> {order.cancellation_reason}
                        </div>
                      )}

                      {order.return_reason && (
                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900">
                          <strong>Return Reason:</strong> {order.return_reason}
                        </div>
                      )}

                      {/* Tracking AWB */}
                      <div className="pt-2">
                        {editingAwbOrderId === order.id ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <input
                              type="text"
                              placeholder="Enter AWB #"
                              value={awbInput}
                              onChange={(e) => setAwbInput(e.target.value)}
                              className="px-2.5 py-1 text-xs border rounded-lg w-full"
                            />
                            <button
                              onClick={() => saveTrackingAwb(order.id)}
                              className="px-3 py-1 text-xs bg-black text-white rounded-lg font-medium cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAwbOrderId(null)}
                              className="px-2 py-1 text-xs text-gray-500 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingAwbOrderId(order.id);
                              setAwbInput(order.tracking_awb || "");
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            📦 {order.tracking_awb ? `AWB: ${order.tracking_awb}` : "+ Add Tracking AWB"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 gap-3">
                      <div className="text-lg sm:text-xl font-bold font-serif text-gray-900">
                        ₹{Number(order.total_amount || order.total || 0).toLocaleString("en-IN")}
                      </div>

                      <select
                        value={order.status || "Pending"}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        <option value="Pending">Order Placed (Pending)</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Catalog & Stock */}
        {activeTab === "catalog" && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Products Catalog</h2>
                <p className="text-xs text-gray-500">Live Inventory control & direct mobile camera upload</p>
              </div>
              <button
                onClick={() => handleOpenProductModal()}
                className="bg-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 transition shadow flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => {
                const isCurrentlyIn =
                  p.in_stock === true ||
                  p.is_in_stock === true ||
                  (p.stock !== undefined && p.stock !== null && Number(p.stock) > 0);

                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-3 relative group">
                        <img
                          src={p.image_url || p.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"}
                          alt={p.name || p.title || "Jewellery"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {p.category || "Jewellery"}
                        </span>
                        <span
                          className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow ${
                            isCurrentlyIn ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                          }`}
                        >
                          {isCurrentlyIn ? "IN STOCK" : "OUT OF STOCK"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{p.name || p.title}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-serif font-bold text-base text-gray-900">₹{p.price}</span>
                        {(p.mrp > p.price || p.original_price > p.price) && (
                          <span className="text-xs text-gray-400 line-through">₹{p.mrp || p.original_price}</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-600 font-medium">
                          Stock: {isCurrentlyIn ? (p.stock || 10) : 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleStockStatus(p)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition shadow-sm cursor-pointer ${
                            isCurrentlyIn
                              ? "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                          }`}
                        >
                          {isCurrentlyIn ? "Mark Out of Stock" : "Mark In Stock"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenProductModal(p)}
                        className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="py-1.5 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Coupons */}
        {activeTab === "coupons" && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Discount Coupons</h2>
                <p className="text-xs text-gray-500">Create promotional promo codes with minimum order limits</p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 transition shadow flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span> Create Coupon
              </button>
            </div>

            {coupons.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                No active coupons found. Click <strong>+ Create Coupon</strong> to create one!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
                          {c.code}
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Active</span>
                      </div>

                      <p className="text-base font-bold text-gray-900 mt-3">
                        {c.discount_percent ? `${c.discount_percent}% OFF` : `₹${c.discount_amount || c.discount || c.discount_value} Flat OFF`}
                      </p>

                      {c.min_order_amount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Min. order: ₹{c.min_order_amount}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">ID: #{c.id?.toString().slice(0, 6)}</span>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                      >
                        Delete Coupon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Hero Banners */}
        {activeTab === "banners" && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hero Banners Slider</h2>
                <p className="text-xs text-gray-500">Manage Flipkart-style interactive banners displayed on storefront</p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="bg-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 transition shadow flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span> Add New Banner
              </button>
            </div>

            {banners.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                No banners found. Click <strong>+ Add New Banner</strong> to set up your slider images!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                    <img src={b.image_url} alt={b.title} className="w-24 h-24 rounded-xl object-cover border" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{b.tag}</span>
                      <h4 className="font-bold text-sm text-gray-900 truncate mt-1">{b.title}</h4>
                      <p className="text-xs font-semibold text-[#a07e56]">{b.subtitle}</p>
                      <p className="text-[11px] text-gray-500 truncate">Target: {b.category_target}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="text-xs font-semibold text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Kundan Bridal Set"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <label className="block font-semibold text-gray-800 mb-1">Product Photo</label>
                <p className="text-[11px] text-gray-500 mb-2">Capture with phone camera, select from gallery, or paste URL</p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-xs shadow-sm hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    📷 Camera / Upload
                  </button>

                  {pImage && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300">
                      <img src={pImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPImage("")}
                        className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="899"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Original Price / MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="1499"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Rings">Rings</option>
                    <option value="Sets">Jewellery Sets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Handcrafted 22k gold plated jewellery..."
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2.5 font-semibold bg-black text-white rounded-xl shadow hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProduct ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Discount Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-medium text-gray-700">Coupon Code *</label>
                  <button
                    type="button"
                    onClick={generateRandomCouponCode}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    ⚡ Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl uppercase font-mono tracking-wider focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCType("percent")}
                  className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    cType === "percent" ? "bg-black text-white border-black" : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCType("flat")}
                  className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    cType === "flat" ? "bg-black text-white border-black" : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  Flat Amount (₹)
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  {cType === "percent" ? "Discount Percentage (%) *" : "Flat Discount (₹) *"}
                </label>
                <input
                  type="number"
                  required
                  placeholder={cType === "percent" ? "15" : "150"}
                  value={cDiscount}
                  onChange={(e) => setCDiscount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  placeholder="499"
                  value={cMinOrder}
                  onChange={(e) => setCMinOrder(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="px-5 py-2.5 font-semibold bg-black text-white rounded-xl shadow hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCoupon ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Add Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Hero Slider Banner</h3>
            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROYAL NECKLACES"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none uppercase font-bold text-black"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Subtitle / Offer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Min. 50% Off"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none text-black"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Handcrafted 18K Gold Plated Masterpieces"
                  value={bDescription}
                  onChange={(e) => setBDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="Festive Special"
                    value={bTag}
                    onChange={(e) => setBTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none text-black"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Category</label>
                  <select
                    value={bCategoryTarget}
                    onChange={(e) => setBCategoryTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-black outline-none text-black cursor-pointer"
                  >
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Rings">Rings</option>
                    <option value="All">All Jewels</option>
                  </select>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <label className="block font-semibold text-gray-800 mb-1">Banner Image *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={bannerFileInputRef}
                    onChange={handleBannerImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-xs shadow-sm hover:bg-gray-100 cursor-pointer text-black"
                  >
                    📷 Select Image File
                  </button>
                  {bImageUrl && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300">
                      <img src={bImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={bImageUrl}
                    onChange={(e) => setBImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="px-5 py-2.5 font-semibold bg-black text-white rounded-xl shadow hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingBanner ? "Saving..." : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}