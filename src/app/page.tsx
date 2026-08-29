"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Droplets, 
  Truck, 
  RefreshCw, 
  ArrowRight, 
  User, 
  Phone, 
  LogOut, 
  CreditCard, 
  Banknote, 
  MessageCircle, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  RotateCcw,
  PackageCheck,
  Clock,
  Tag,
  Star,
  Camera,
  ThumbsUp,
  BadgeCheck,
  Image as ImageIcon,
  ExternalLink,
  MapPin,
  Check,
  Share2,
  Copy,
  Loader2,
  KeyRound,
  Ban,
  Percent,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  RotateCcw as ReturnIcon,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic Banners from Supabase Database
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slide Hero Banners every 5 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [uploadingReviewPhoto, setUploadingReviewPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Dynamic Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Customer Auth States
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"details" | "orders">("details");
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [pendingActionProduct, setPendingActionProduct] = useState<any | null>(null);

  // Return / Cancel Modal States
  const [cancelModalOrderId, setCancelModalOrderId] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnModalOrderId, setReturnModalOrderId] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("trovella_customer");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCustomerUser(parsed);
      setCustomer(prev => ({
        ...prev,
        name: parsed.name || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
        city: parsed.city || "",
        pincode: parsed.pincode || ""
      }));
    }
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (prodData) setProducts(prodData);

    const { data: coupData } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: false });
    if (coupData) setAvailableCoupons(coupData);

    const { data: revData } = await supabase
      .from("reviews")
      .select("*")
      .order("id", { ascending: false });
    if (revData) setReviews(revData);

    const { data: banData } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: false });
      
    if (banData && banData.length > 0) {
      setHeroBanners(banData);
    } else {
      setHeroBanners([
        {
          id: 1,
          title: "ROYAL NECKLACES",
          subtitle: "Min. 50% Off",
          description: "Handcrafted 18K Gold Plated Masterpieces",
          tag: "Festive Special",
          category_target: "Necklaces",
          image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        }
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const filtered = reviews.filter(r => r.product_id === selectedProduct.id);
      setProductReviews(filtered);
      setActiveImageIndex(0);
    }
  }, [selectedProduct, reviews]);

  const fetchCustomerOrders = async (phone: string) => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", phone)
      .order("id", { ascending: false });
    if (data) setCustomerOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (customerUser?.phone && isProfileModalOpen) {
      fetchCustomerOrders(customerUser.phone);
    }
  }, [customerUser, isProfileModalOpen]);

  const handleCustomerCancelOrder = async (orderId: any) => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "Cancelled", cancellation_reason: cancelReason.trim() })
      .eq("id", orderId);

    if (error) {
      alert("Failed to cancel order: " + error.message);
    } else {
      alert("Order cancelled successfully.");
      setCancelModalOrderId(null);
      setCancelReason("");
      if (customerUser?.phone) fetchCustomerOrders(customerUser.phone);
    }
  };

  const handleCustomerReturnOrder = async (orderId: any) => {
    if (!returnReason.trim()) {
      alert("Please provide a return reason.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "Return Requested", return_reason: returnReason.trim() })
      .eq("id", orderId);

    if (error) {
      alert("Failed to request return: " + error.message);
    } else {
      alert("Return request submitted successfully. Our team will contact you for doorstep pickup.");
      setReturnModalOrderId(null);
      setReturnReason("");
      if (customerUser?.phone) fetchCustomerOrders(customerUser.phone);
    }
  };

  const handleSendInstantOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanNumber, otp: code }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setOtpError(data.error || "SMS failed to deliver. Check Fast2SMS setup.");
      } else {
        setEnteredOtp("");
        setAuthStep("otp");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to reach /api/send-otp endpoint");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!enteredOtp || enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError("Invalid SMS verification code. Please check your messages.");
      return;
    }

    setIsVerifyingOtp(true);
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const newProfile = {
      phone: cleanPhone,
      name: customer.name || `User ${cleanPhone.slice(-4)}`,
      address: customer.address || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      joinedAt: new Date().toLocaleDateString()
    };

    setCustomerUser(newProfile);
    localStorage.setItem("trovella_customer", JSON.stringify(newProfile));
    setIsAuthModalOpen(false);
    setAuthStep("phone");
    setEnteredOtp("");
    setIsVerifyingOtp(false);

    if (pendingActionProduct) {
      executeAddToCart(pendingActionProduct);
      setPendingActionProduct(null);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("trovella_customer");
    setCustomerUser(null);
    setIsProfileModalOpen(false);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "newest") {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const handleAddToCartAttempt = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const currentStock = Number(product.stock ?? (product.is_in_stock !== false ? 10 : 0));
    if (product.is_in_stock === false || currentStock <= 0) {
      alert("Sorry, this jewellery piece is currently Out of Stock.");
      return;
    }

    if (!customerUser) {
      setPendingActionProduct(product);
      setIsAuthModalOpen(true);
      return;
    }

    executeAddToCart(product);
  };

  const executeAddToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      const currentStock = Number(product.stock ?? 10);
      
      if (exists) {
        if (exists.quantity >= currentStock) {
          alert(`Only ${currentStock} items available in stock!`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const targetProd = products.find(p => p.id === id);
        const maxStock = Number(targetProd?.stock ?? 10);
        const newQty = item.quantity + delta;

        if (delta > 0 && newQty > maxStock) {
          alert(`Only ${maxStock} items available in stock!`);
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as any[]);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleShareToWhatsApp = (prod: any) => {
    const text = `Hey! Look at this gorgeous ${prod.title} from TROVELLA ✨%0A• Price: ₹${prod.price}%0A• 18K Gold Plated & Lifetime Anti-Tarnish%0A%0ACheck it out here: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleNativeShare = async (prod: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TROVELLA - ${prod.title}`,
          text: `Check out ${prod.title} on TROVELLA! 18K Gold Plated Everyday Fine Jewellery.`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      handleCopyLink();
    }
  };

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (reviewPhotos.length >= 3) {
      alert("You can attach up to 3 photos per review.");
      return;
    }

    setUploadingReviewPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setReviewPhotos(prev => [...prev, publicUrlData.publicUrl]);
    } catch (err: any) {
      alert("Failed to upload review image: " + err.message);
    } finally {
      setUploadingReviewPhoto(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedProduct) return;
    const reviewer = newReviewerName.trim() || customerUser?.name || "Verified Buyer";
    if (!newReviewComment.trim()) {
      alert("Please write your review feedback.");
      return;
    }

    setSubmittingReview(true);
    const { data, error } = await supabase.from("reviews").insert([
      {
        product_id: selectedProduct.id,
        customer_name: reviewer,
        rating: newRating,
        comment: newReviewComment.trim(),
        image_urls: reviewPhotos,
        is_verified_purchase: true
      }
    ]).select();

    setSubmittingReview(false);

    if (error) {
      alert("Failed to post review: " + error.message);
    } else if (data) {
      setReviews(prev => [data[0], ...prev]);
      setNewReviewComment("");
      setNewReviewerName("");
      setReviewPhotos([]);
      alert("Thank you! Your verified review & photos are live now.");
    }
  };

  const handleLikeReview = async (reviewId: number, currentLikes: number) => {
    const { error } = await supabase
      .from("reviews")
      .update({ helpful_count: (currentLikes || 0) + 1 })
      .eq("id", reviewId);

    if (!error) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r));
    }
  };

  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const getMinOrderVal = (c: any) => Number(c.min_order_amount ?? c.min_order_value ?? c.min_order ?? c.min_value ?? 0);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const minReq = getMinOrderVal(appliedCoupon);
    if (rawSubtotal < minReq) return 0;
    
    const isPercent = appliedCoupon.discount_type === "percentage" || appliedCoupon.discount_percent || appliedCoupon.discount_type === "percent";
    const discVal = Number(appliedCoupon.discount_value ?? appliedCoupon.discount_percent ?? appliedCoupon.discount_amount ?? appliedCoupon.discount ?? 0);

    if (isPercent) {
      return Math.round((rawSubtotal * discVal) / 100);
    } else {
      return Math.min(discVal, rawSubtotal);
    }
  }, [appliedCoupon, rawSubtotal]);

  const finalPayableAmount = Math.max(0, rawSubtotal - discountAmount);

  const applyCouponObject = (couponObj: any) => {
    setCouponError("");
    const minReq = getMinOrderVal(couponObj);
    if (rawSubtotal < minReq) {
      setCouponError(`Add items worth ₹${minReq - rawSubtotal} more to use code ${couponObj.code}! (Min cart ₹${minReq})`);
      return;
    }
    setAppliedCoupon(couponObj);
    setCouponInput("");
  };

  const handleApplyCouponFromInput = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const codeToSearch = couponInput.trim().toUpperCase();
    if (!codeToSearch) return;

    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", codeToSearch)
      .eq("is_active", true)
      .single();

    setCouponLoading(false);

    if (error || !data) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }

    applyCouponObject(data);
  };

  const sendWhatsAppNotification = (orderData: any) => {
    const itemsList = orderData.items.map((i: any) => `• ${i.title} (x${i.quantity}) - ₹${i.price * i.quantity}`).join("%0A");
    const couponLine = orderData.coupon_applied ? `%0A*Coupon Applied:* ${orderData.coupon_applied} (-₹${orderData.discount_amount})` : "";
    const msg = `*✨ NEW ORDER RECEIVED - TROVELLA ✨*%0A%0A*Customer:* ${orderData.customer_name}%0A*Phone:* ${orderData.phone}%0A*Address:* ${orderData.address}, ${orderData.city} - ${orderData.pincode}%0A%0A*Items Ordered:*%0A${itemsList}${couponLine}%0A%0A*Final Amount Paid:* ₹${orderData.total_amount}%0A*Payment Mode:* ${orderData.payment_method}%0A%0A_Please confirm dispatch timeline._`;
    window.open(`https://wa.me/918707238011?text=${msg}`, "_blank");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || (!customerUser?.phone && !customer.phone) || !customer.address || !customer.pincode) {
      alert("Please fill all delivery details!");
      return;
    }

    for (const item of cart) {
      const prodInDb = products.find(p => p.id === item.id);
      const currentStock = Number(prodInDb?.stock ?? 10);
      if (item.quantity > currentStock) {
        alert(`Sorry, "${item.title}" only has ${currentStock} left in stock! Please update your cart.`);
        return;
      }
    }

    const orderPayload = {
      customer_name: customer.name,
      phone: customerUser?.phone || customer.phone,
      address: customer.address,
      city: customer.city,
      pincode: customer.pincode,
      payment_method: customer.paymentMethod === "online" ? "Prepaid (Online)" : "Cash on Delivery",
      total_amount: finalPayableAmount,
      coupon_applied: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount,
      items: cart,
      status: "Order Placed"
    };

    const deductStockInDatabase = async () => {
      for (const item of cart) {
        const prodInDb = products.find(p => p.id === item.id);
        if (prodInDb) {
          const newStock = Math.max(0, Number(prodInDb.stock ?? 10) - item.quantity);
          const isStillInStock = newStock > 0;

          await supabase
            .from("products")
            .update({
              stock: newStock,
              in_stock: isStillInStock,
              is_in_stock: isStillInStock
            })
            .eq("id", item.id);
        }
      }
    };

    if (customer.paymentMethod === "online") {
      setIsProcessingPayment(true);
      try {
        const res = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalPayableAmount }),
        });
        const orderData = await res.json();

        if (orderData.error) {
          alert("Payment gateway error: " + orderData.error);
          setIsProcessingPayment(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "TROVELLA",
          description: "Everyday Fine Jewellery",
          order_id: orderData.id,
          prefill: {
            name: customer.name,
            contact: customerUser?.phone || customer.phone,
          },
          theme: { color: "#1A1A1A" },
          handler: async function () {
            await supabase.from("orders").insert([orderPayload]);
            await deductStockInDatabase();
            setLastPlacedOrder(orderPayload);
            setOrderPlaced(true);
            setCart([]);
            setAppliedCoupon(null);
            setIsProcessingPayment(false);
            fetchInitialData();
            if (customerUser?.phone) fetchCustomerOrders(customerUser.phone);
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err: any) {
        alert("Payment initialization failed: " + err.message);
        setIsProcessingPayment(false);
      }
    } else {
      const { error } = await supabase.from("orders").insert([orderPayload]);

      if (error) {
        alert("Order placing failed: " + error.message);
      } else {
        await deductStockInDatabase();
        setLastPlacedOrder(orderPayload);
        setOrderPlaced(true);
        setCart([]);
        setAppliedCoupon(null);
        fetchInitialData();
        if (customerUser?.phone) fetchCustomerOrders(customerUser.phone);
      }
    }
  };

  const reviewStats = useMemo(() => {
    if (productReviews.length === 0) return { avg: "0.0", count: 0, breakdown: [0, 0, 0, 0, 0] };
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / productReviews.length).toFixed(1);
    const breakdown = [0, 0, 0, 0, 0];
    productReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[5 - r.rating]++;
      }
    });
    return { avg, count: productReviews.length, breakdown };
  }, [productReviews]);

  const allCustomerPhotos = useMemo(() => {
    const photos: string[] = [];
    productReviews.forEach(r => {
      if (r.image_urls && Array.isArray(r.image_urls)) {
        photos.push(...r.image_urls);
      }
    });
    return photos;
  }, [productReviews]);

  const trackingStages = [
    { label: "Placed", match: "Order Placed" },
    { label: "Packed", match: "Packed & Ready" },
    { label: "In Transit", match: "Shipped / In Transit" },
    { label: "Out for Delivery", match: "Out for Delivery" },
    { label: "Delivered", match: "Delivered" }
  ];

  const getStageIndex = (status: string) => {
    const idx = trackingStages.findIndex(s => s.match === status);
    return idx === -1 ? 0 : idx;
  };

  const categories = ["All", "Bracelets", "Rings", "Necklaces", "Earrings"];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#070709] text-white font-sans antialiased selection:bg-[#C5A880] selection:text-black">
      
      {/* Top Announcement Bar */}
      <aside className="w-full bg-gradient-to-r from-[#111116] via-[#1f1f2b] to-[#111116] text-[#E8DFC8] text-[11px] md:text-xs py-3 px-4 text-center font-medium tracking-[0.25em] flex justify-center items-center gap-2 border-b border-white/10 shadow-2xl">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A880] animate-spin shrink-0" style={{ animationDuration: '4s' }} />
        <span>Use Code <strong className="text-white underline underline-offset-4 decoration-[#C5A880]">FIRST10</strong> for extra 10% OFF • 18K Gold Plated Fine Jewellery</span>
      </aside>

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#070709]/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl sm:text-3xl tracking-[0.3em] font-extrabold uppercase text-white drop-shadow-[0_0_20px_rgba(197,168,128,0.5)]">
            TROVELLA<span className="text-[#C5A880]">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-bold text-gray-300">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)} 
                className={`hover:text-[#C5A880] transition duration-300 cursor-pointer pb-1 relative group ${
                  activeCategory === cat ? "text-[#C5A880] font-extrabold" : "text-gray-400"
                }`}
              >
                {cat === "All" ? "All Jewels" : cat}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880] transition-all duration-300 ${activeCategory === cat ? "scale-x-100 shadow-[0_0_10px_#C5A880]" : "scale-x-0 group-hover:scale-x-100"}`} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {customerUser ? (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/15 text-white px-4 py-2.5 rounded-full hover:bg-white/10 transition cursor-pointer shadow-lg backdrop-blur-md"
              >
                <div className="w-5 h-5 rounded-full bg-[#C5A880] text-black flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_#C5A880]">
                  <User className="w-3 h-3" />
                </div>
                <span className="max-w-[90px] truncate">{customerUser.name || customerUser.phone}</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black px-5 py-2.5 rounded-full hover:brightness-110 transition cursor-pointer shadow-[0_0_20px_rgba(197,168,128,0.4)]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            <button 
              onClick={() => {
                if (!customerUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCartOpen(true);
                }
              }} 
              className="relative p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition cursor-pointer shadow-lg backdrop-blur-md"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A880] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-[0_0_10px_#C5A880] animate-pulse">
                  {cart.reduce((t, i) => t + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ULTRA LUXURIOUS 3D HERO BANNER CAROUSEL */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="relative w-full h-[280px] sm:h-[420px] rounded-[3rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/20 group bg-[#111116]">
          
          {heroBanners.map((banner, index) => (
            <div
              key={banner.id}
              onClick={() => {
                setActiveCategory(banner.category_target || "All");
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer flex items-center justify-between p-8 sm:p-16 bg-gradient-to-r from-neutral-950 via-[#181822] to-[#070709] ${
                index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
              }`}
            >
              {/* Left Content */}
              <div className="max-w-lg space-y-4 sm:space-y-6 z-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-black text-[#C5A880] bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 shadow-[0_0_15px_rgba(197,168,128,0.3)]">
                  <Sparkles className="w-3 h-3 text-[#C5A880]" /> {banner.tag || "Exclusive Luxury"}
                </span>
                <h2 className="text-3xl sm:text-6xl font-serif font-extrabold text-white tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  {banner.title}
                </h2>
                <div className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A880] drop-shadow-md">
                  {banner.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 font-light max-w-md hidden sm:block leading-relaxed tracking-wider">
                  {banner.description || "Crafted with precision for the modern icon. 18K gold plated perfection."}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black hover:brightness-110 text-xs font-black uppercase tracking-[0.25em] px-8 py-3.5 rounded-full shadow-[0_0_25px_rgba(197,168,128,0.5)] transition">
                    Explore Collection <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Right Banner Image with Glow Depth */}
              <div className="relative w-44 sm:w-80 h-44 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border-2 border-white/25 shrink-0 bg-black group-hover:scale-105 transition duration-700">
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover block" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl cursor-pointer hover:bg-white hover:text-black"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl cursor-pointer hover:bg-white hover:text-black"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentSlide ? "w-10 bg-[#C5A880] shadow-[0_0_10px_#C5A880]" : "w-2.5 bg-white/40 hover:bg-white"
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-b border-white/10 bg-[#0d0d12] shadow-2xl relative z-20 mt-6">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl hover:border-[#C5A880]/60 transition duration-300">
            <Droplets className="w-6 h-6 text-[#C5A880] mb-2 drop-shadow-[0_0_8px_#C5A880]" />
            <h4 className="text-xs font-bold text-white tracking-wider">100% Waterproof</h4>
            <p className="text-[10px] text-gray-400 mt-1">Shower & gym resistant</p>
          </div>
          <div className="flex flex-col items-center p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl hover:border-[#C5A880]/60 transition duration-300">
            <ShieldCheck className="w-6 h-6 text-[#C5A880] mb-2 drop-shadow-[0_0_8px_#C5A880]" />
            <h4 className="text-xs font-bold text-white tracking-wider">Lifetime Anti-Tarnish</h4>
            <p className="text-[10px] text-gray-400 mt-1">Guaranteed color retention</p>
          </div>
          <div className="flex flex-col items-center p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl hover:border-[#C5A880]/60 transition duration-300">
            <Truck className="w-6 h-6 text-[#C5A880] mb-2 drop-shadow-[0_0_8px_#C5A880]" />
            <h4 className="text-xs font-bold text-white tracking-wider">Express Delivery</h4>
            <p className="text-[10px] text-gray-400 mt-1">Dispatched in 24 hours</p>
          </div>
          <div className="flex flex-col items-center p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl hover:border-[#C5A880]/60 transition duration-300">
            <RefreshCw className="w-6 h-6 text-[#C5A880] mb-2 drop-shadow-[0_0_8px_#C5A880]" />
            <h4 className="text-xs font-bold text-white tracking-wider">7-Day Exchanges</h4>
            <p className="text-[10px] text-gray-400 mt-1">Hassle-free door pickup</p>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#12121a] p-6 rounded-[2.5rem] border border-white/10 shadow-2xl mb-12 backdrop-blur-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4.5 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search luxury catalog: necklace, ring, bracelet, 18k gold..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#070709] border border-white/15 rounded-2xl pl-12 pr-10 py-3.5 text-xs font-medium text-white focus:outline-none focus:border-[#C5A880] transition shadow-inner"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#070709] border border-white/15 px-4 py-3.5 rounded-2xl text-xs shadow-inner">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-gray-400 font-semibold">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#12121a]">Featured Jewels</option>
                <option value="price-low" className="bg-[#12121a]">Price: Low to High</option>
                <option value="price-high" className="bg-[#12121a]">Price: High to Low</option>
                <option value="newest" className="bg-[#12121a]">Newest First</option>
              </select>
            </div>

            {(searchQuery || activeCategory !== "All" || sortBy !== "featured") && (
              <button 
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); setSortBy("featured"); }}
                className="p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition cursor-pointer shadow-lg border border-white/10"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">Curated Collection</h2>
            <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">Showing {filteredAndSortedProducts.length} 3D handcrafted masterpieces</p>
          </div>
           
          <div className="flex gap-2.5 overflow-x-auto w-full md:w-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-7 py-3 rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-xl ${
                  activeCategory === cat ? "bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black font-black shadow-[0_0_25px_rgba(197,168,128,0.5)] scale-105" : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                }`}
              >
                {cat === "All" ? "All Jewels" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid with Live Low Stock Urgency Badges */}
        {loading ? (
          <div className="text-center py-28 space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#C5A880]" />
            <p className="text-xs text-gray-400 font-semibold tracking-[0.2em]">Loading 3D showroom...</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-24 bg-[#12121a] rounded-[2.5rem] border border-white/10 p-8 max-w-sm mx-auto shadow-2xl space-y-4">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-500" />
            <h3 className="font-bold text-sm text-white">No matching jewellery found</h3>
            <p className="text-xs text-gray-400">Try changing your search terms or filter selection.</p>
            <button 
              onClick={() => { setActiveCategory("All"); setSearchQuery(""); setSortBy("featured"); }}
              className="bg-white text-black text-xs px-5 py-3 rounded-2xl font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:bg-[#C5A880] transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedProducts.map((product) => {
              const prodReviews = reviews.filter(r => r.product_id === product.id);
              const avgRating = prodReviews.length > 0 
                ? (prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1) 
                : null;
              
              const currentStock = Number(product.stock ?? (product.is_in_stock !== false ? 10 : 0));
              const isInStock = product.is_in_stock !== false && currentStock > 0;
              const isLowStock = isInStock && currentStock <= 5;

              return (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className={`group bg-[#12121a] rounded-[2.5rem] border p-5 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(197,168,128,0.2)] hover:border-[#C5A880]/60 transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 ${
                    isInStock ? "border-white/10" : "border-white/5 opacity-75"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#070709] mb-4 shadow-inner border border-white/5">
                    {!isInStock ? (
                      <span className="absolute top-3.5 left-3.5 z-10 bg-red-600 text-white text-[9px] font-black uppercase px-3.5 py-1 rounded-full shadow-lg tracking-widest">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute top-3.5 left-3.5 z-10 bg-amber-500 text-black text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Only {currentStock} left!
                      </span>
                    ) : (
                      <span className="absolute top-3.5 left-3.5 z-10 bg-black/80 backdrop-blur-md text-[9px] font-extrabold uppercase px-3 py-1 rounded-full border border-white/15 shadow-md tracking-wider text-[#C5A880]">
                        {product.tag || "3D Anti-Tarnish"}
                      </span>
                    )}

                    {avgRating && (
                      <span className="absolute bottom-3.5 left-3.5 z-10 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {avgRating} ({prodReviews.length})
                      </span>
                    )}

                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className={`w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ${
                        !isInStock ? "grayscale contrast-75" : ""
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611591475102-4ab8c4d7342d?q=80&w=800";
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 px-1">
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-[0.25em] font-extrabold">{product.category}</span>
                    <h3 className="font-semibold text-xs md:text-sm text-white truncate group-hover:text-[#C5A880] transition">{product.title}</h3>
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <span className="text-base md:text-lg font-serif font-bold text-white">₹{product.price}</span>
                      {product.mrp && <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>}
                    </div>
                  </div>

                  {isInStock ? (
                    <button 
                      onClick={(e) => handleAddToCartAttempt(product, e)}
                      className="mt-5 w-full bg-white text-black py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg group-hover:shadow-[0_0_25px_rgba(197,168,128,0.5)]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="mt-5 w-full bg-white/5 text-gray-500 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1.5 border border-white/5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Out of Stock
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product & Reviews Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#121218] rounded-[3rem] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-[0_0_60px_rgba(0,0,0,0.9)] relative flex flex-col md:flex-row border border-white/20 text-white">
            <button 
              onClick={() => { setSelectedProduct(null); setReviewPhotos([]); }}
              className="absolute top-5 right-5 z-20 bg-white/10 p-2.5 rounded-full hover:bg-white hover:text-black transition shadow-lg cursor-pointer border border-white/20 backdrop-blur-md"
            >
              <X className="w-4 h-4"/>
            </button>
             
            <div className="w-full md:w-1/2 p-6 md:p-8 md:border-r border-white/10 space-y-5 bg-[#070709]/60">
              <div 
                className="aspect-square rounded-[2.5rem] overflow-hidden bg-black border border-white/15 relative group cursor-zoom-in shadow-2xl"
                onClick={() => {
                  const currentImg = (selectedProduct.images && selectedProduct.images.length > 0)
                    ? selectedProduct.images[activeImageIndex]
                    : selectedProduct.image_url;
                  setPreviewZoomImage(currentImg);
                }}
              >
                {selectedProduct.is_in_stock === false && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-red-600 text-white font-black text-sm uppercase px-5 py-2 rounded-full tracking-wider shadow-xl">
                      Currently Sold Out
                    </span>
                  </div>
                )}
                
                <img 
                  src={
                    (selectedProduct.images && selectedProduct.images.length > 0) 
                      ? selectedProduct.images[activeImageIndex] 
                      : selectedProduct.image_url
                  } 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                />

                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-white/15 opacity-90 group-hover:opacity-100 transition">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" /> Click to Zoom 3D
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {selectedProduct.images.map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-black shadow-md ${
                        activeImageIndex === idx ? "border-[#C5A880] ring-2 ring-[#C5A880]/40 scale-105 shadow-[0_0_10px_#C5A880]" : "border-white/15 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-[#C5A880] uppercase tracking-[0.25em] font-extrabold">{selectedProduct.category}</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight">{selectedProduct.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-serif font-bold text-white">₹{selectedProduct.price}</span>
                  {selectedProduct.mrp && <span className="text-sm text-gray-500 line-through">₹{selectedProduct.mrp}</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {selectedProduct.description || "Crafted in 316L hypoallergenic surgical stainless steel with thick 18K gold plating. Anti-tarnish waterproof jewellery."}
                </p>
              </div>

              {selectedProduct.is_in_stock !== false ? (
                <button 
                  onClick={(e) => handleAddToCartAttempt(selectedProduct, e)}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(197,168,128,0.5)]"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-white/5 text-gray-500 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 border border-white/5"
                >
                  <Ban className="w-4 h-4" /> Out of Stock • Available Soon
                </button>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Share Jewel:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleShareToWhatsApp(selectedProduct)}
                    className="p-2.5 bg-green-950/50 hover:bg-green-900/50 text-green-400 border border-green-500/30 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-green-400 text-green-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button 
                    onClick={() => handleNativeShare(selectedProduct)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button 
                    onClick={handleCopyLink}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {linkCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{linkCopied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 space-y-6 flex flex-col justify-between bg-[#12121a]">
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-5">
                  <h3 className="font-serif font-bold text-xl text-white">Ratings & Customer Reviews</h3>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center border-r border-white/10 pr-6">
                      <div className="text-4xl font-serif font-bold text-white flex items-center justify-center gap-1">
                        {reviewStats.avg} <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{reviewStats.count} Verified Reviews</p>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px]">
                      {[5, 4, 3, 2, 1].map((stars, idx) => {
                        const count = reviewStats.breakdown[idx];
                        const pct = reviewStats.count > 0 ? (count / reviewStats.count) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="w-3 text-gray-400 font-bold">{stars}★</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 w-4 text-right font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {allCustomerPhotos.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C5A880]" /> Customer Gallery Photos ({allCustomerPhotos.length})
                    </h4>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                      {allCustomerPhotos.map((photo, pIdx) => (
                        <img 
                          key={pIdx} 
                          src={photo} 
                          alt="Customer review" 
                          onClick={() => setPreviewZoomImage(photo)}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/15 cursor-pointer hover:scale-105 transition shrink-0 shadow-lg" 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {productReviews.length === 0 ? (
                    <div className="text-center py-8 space-y-2 bg-black/40 rounded-2xl border border-white/5">
                      <Camera className="w-8 h-8 text-gray-500 mx-auto" />
                      <p className="text-xs font-semibold text-gray-300">No reviews yet for this piece</p>
                      <p className="text-[11px] text-gray-500">Be the first to share your wear photos!</p>
                    </div>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-2 text-xs shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{rev.customer_name}</span>
                              {rev.is_verified_purchase && (
                                <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5 bg-green-950/60 px-2 py-0.5 rounded-full border border-green-500/30">
                                  <BadgeCheck className="w-3 h-3 text-green-400" /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <div className="flex mt-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"}`} />
                              ))}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleLikeReview(rev.id, rev.helpful_count)}
                            className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white cursor-pointer bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 shadow-sm"
                          >
                            <ThumbsUp className="w-3 h-3 text-[#C5A880]" /> {rev.helpful_count || 0}
                          </button>
                        </div>

                        <p className="text-gray-300 text-xs leading-relaxed">{rev.comment}</p>

                        {rev.image_urls && rev.image_urls.length > 0 && (
                          <div className="flex gap-2 pt-1">
                            {rev.image_urls.map((img: string, i: number) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt="Customer review" 
                                onClick={() => setPreviewZoomImage(img)}
                                className="w-12 h-12 rounded-xl object-cover border border-white/15 cursor-pointer hover:opacity-80 transition shadow-sm" 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleAddReview} className="bg-black/50 p-4 rounded-3xl border border-white/10 space-y-3 text-xs shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Rate this product:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Star 
                        key={num} 
                        onClick={() => setNewRating(num)}
                        className={`w-4 h-4 cursor-pointer transition ${num <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-700"}`}
                      />
                    ))}
                  </div>
                </div>

                {!customerUser && (
                  <input 
                    type="text" 
                    placeholder="Your Name (e.g. Pooja Verma)" 
                    value={newReviewerName}
                    onChange={e => setNewReviewerName(e.target.value)}
                    className="w-full p-2.5 bg-[#070709] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880] shadow-inner"
                  />
                )}

                <textarea 
                  rows={2} 
                  required 
                  placeholder="How does it look? Describe shine, polish, and fit..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-[#070709] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880] shadow-inner"
                />

                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-white/10 border border-white/15 hover:border-white rounded-xl text-[11px] font-bold text-white cursor-pointer transition shadow-sm">
                    <Camera className="w-4 h-4 text-[#C5A880]" />
                    <span>{uploadingReviewPhoto ? "Uploading..." : "Add Wear Photo"}</span>
                    <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} className="hidden" disabled={uploadingReviewPhoto} />
                  </label>

                  <div className="flex gap-1.5">
                    {reviewPhotos.map((p, idx) => (
                      <div key={idx} className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                        <img src={p} alt="upload" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setReviewPhotos(reviewPhotos.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-black/80 text-white text-[9px] px-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingReview || uploadingReviewPhoto}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-3 rounded-2xl font-black uppercase tracking-wider text-[11px] hover:brightness-110 transition cursor-pointer shadow-[0_0_15px_rgba(197,168,128,0.3)]"
                >
                  {submittingReview ? "Submitting..." : "Post Customer Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Lightbox */}
      {previewZoomImage && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <button onClick={() => setPreviewZoomImage(null)} className="absolute top-6 right-6 text-white hover:text-gray-300 p-3 bg-white/10 rounded-full cursor-pointer transition border border-white/15">
            <X className="w-6 h-6" />
          </button>
          <img src={previewZoomImage} alt="Zoom preview" className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-[0_0_50px_rgba(197,168,128,0.3)] border border-white/20" />
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-[#121218] text-white h-full p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-y-auto border-l border-white/15">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h3 className="font-serif font-bold text-xl text-white">Shopping Bag ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition"><X className="w-5 h-5"/></button>
              </div>
               
              <div className="divide-y divide-white/10 max-h-[36vh] overflow-y-auto mt-2">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">Your shopping bag is empty.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-2xl object-cover border border-white/15 shadow-md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                        <p className="text-xs font-serif font-bold text-[#C5A880] mt-0.5">₹{item.price}</p>
                        <div className="flex items-center gap-2.5 mt-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer transition"><Minus className="w-3 h-3"/></button>
                          <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer transition"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-400 p-2 cursor-pointer transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t border-white/10 pt-5 space-y-4">
                 
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" /> Available Offers
                    </span>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {availableCoupons.map((c) => {
                      const isThisApplied = appliedCoupon?.code === c.code;
                      const minReq = getMinOrderVal(c);

                      return (
                        <div 
                          key={c.id} 
                          className={`p-3 rounded-2xl border min-w-[180px] max-w-[200px] shrink-0 text-xs flex flex-col justify-between space-y-2 transition shadow-lg ${
                            isThisApplied 
                              ? "bg-green-950/60 border-green-500/50 ring-1 ring-green-500/50" 
                              : "bg-black/50 border-white/15"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-[11px] bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 text-white">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-black text-[#C5A880]">
                              {c.discount_type === "percentage" || c.discount_percent ? `${c.discount_value || c.discount_percent}% OFF` : `₹${c.discount_value || c.discount_amount || c.discount} OFF`}
                            </span>
                          </div>

                          <p className="text-[10px] text-gray-400 truncate leading-tight">
                            {c.description || `Min cart: ₹${minReq}`}
                          </p>

                          {isThisApplied ? (
                            <button 
                              onClick={() => setAppliedCoupon(null)} 
                              className="w-full bg-green-600 text-white py-1.5 rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 shadow-md"
                            >
                              <Check className="w-3 h-3" /> Applied (Remove)
                            </button>
                          ) : (
                            <button 
                              onClick={() => applyCouponObject(c)} 
                              className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] hover:brightness-110 text-black py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-md"
                            >
                              Apply Offer
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleApplyCouponFromInput} className="flex gap-2 pt-1">
                    <input 
                      type="text" 
                      placeholder="Enter promo code..." 
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/50 border border-white/15 rounded-2xl px-4 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-[#C5A880] shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={couponLoading}
                      className="bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs px-5 py-2.5 rounded-2xl font-bold uppercase tracking-wider cursor-pointer shadow-md transition"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </form>

                  {couponError && <p className="text-[11px] text-red-400 font-semibold">{couponError}</p>}
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 pt-3 border-t border-white/10">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">₹{rawSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400 font-bold">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-serif font-bold text-white pt-2 border-t border-white/5">
                    <span>Final Payable</span>
                    <span className="text-base text-[#C5A880]">₹{finalPayableAmount}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(197,168,128,0.4)]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121218] text-white rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-white/15">
            {orderPlaced ? (
              <div className="text-center py-8 space-y-5">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce drop-shadow-[0_0_15px_#22c55e]" />
                <div>
                  <h3 className="font-serif font-bold text-3xl text-white">Order Confirmed!</h3>
                  <p className="text-xs text-gray-400 mt-1.5">Thank you for shopping with Trovella. Your elegance awaits.</p>
                </div>

                {lastPlacedOrder && (
                  <button 
                    onClick={() => sendWhatsAppNotification(lastPlacedOrder)}
                    className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> Connect on WhatsApp for Dispatch Alert
                  </button>
                )}

                <button 
                  onClick={() => { setOrderPlaced(false); setIsCheckoutOpen(false); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-3 rounded-2xl font-bold uppercase tracking-wider cursor-pointer transition border border-white/10"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">Delivery & Secure Payment</h3>
                  <button type="button" onClick={() => setIsCheckoutOpen(false)} className="p-1 hover:bg-white/10 rounded-full cursor-pointer transition"><X className="w-4 h-4"/></button>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Full Name</label>
                  <input required type="text" placeholder="e.g. Aditi Sharma" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-300">WhatsApp Mobile Number</label>
                  <input required type="tel" placeholder="10-digit mobile number" value={customerUser?.phone || customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Shipping Address</label>
                  <textarea required rows={2} placeholder="Flat, Street, Landmark..." value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">City</label>
                    <input required type="text" placeholder="City" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Pincode</label>
                    <input required type="text" placeholder="Pincode" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="font-bold block text-white">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setCustomer({...customer, paymentMethod: "online"})}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 cursor-pointer transition shadow-md ${
                        customer.paymentMethod === "online" ? "border-[#C5A880] bg-white/10 ring-1 ring-[#C5A880]" : "border-white/15 bg-black/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <CreditCard className="w-4 h-4 text-[#C5A880]" />
                        <span>UPI / Cards</span>
                      </div>
                      <p className="text-[10px] text-gray-400">GPay, PhonePe, Cards</p>
                    </div>

                    <div 
                      onClick={() => setCustomer({...customer, paymentMethod: "cod"})}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 cursor-pointer transition shadow-md ${
                        customer.paymentMethod === "cod" ? "border-[#C5A880] bg-white/10 ring-1 ring-[#C5A880]" : "border-white/15 bg-black/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <Banknote className="w-4 h-4 text-green-400" />
                        <span>Cash On Delivery</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Pay upon delivery</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5 text-xs shadow-inner">
                  <div className="flex justify-between text-gray-400">
                    <span>Cart Total:</span>
                    <span>₹{rawSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400 font-bold">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-serif font-bold text-white pt-1.5 border-t border-white/10">
                    <span>Total Amount:</span>
                    <span className="text-[#C5A880]">₹{finalPayableAmount}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessingPayment}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-4 rounded-2xl font-black hover:brightness-110 transition mt-2 text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_0_25px_rgba(197,168,128,0.4)]"
                >
                  {isProcessingPayment 
                    ? "Connecting Payment Gateway..." 
                    : customer.paymentMethod === "online" 
                      ? `Pay ₹{finalPayableAmount} via UPI / Card` 
                      : `Place COD Order • ₹${finalPayableAmount}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121218] text-white rounded-[2.5rem] max-w-sm w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative space-y-5 border border-white/15">
            <button onClick={() => { setIsAuthModalOpen(false); setOtpError(""); }} className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 cursor-pointer transition"><X className="w-5 h-5" /></button>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-black/50 rounded-3xl border border-white/15 flex items-center justify-center mx-auto text-[#C5A880] shadow-lg mb-1"><Phone className="w-6 h-6" /></div>
              <h3 className="font-serif font-bold text-2xl text-white">Welcome to Trovella</h3>
              <p className="text-xs text-gray-400 font-light">Sign in with mobile number for instant access & order tracking</p>
            </div>

            {authStep === "phone" ? (
              <form onSubmit={handleSendInstantOtp} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 bg-black/50 border border-r-0 border-white/15 rounded-l-2xl text-gray-300 font-bold shadow-inner">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10} 
                      required 
                      placeholder="9876543210" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 bg-black/50 border border-white/15 rounded-r-2xl text-white focus:outline-none focus:border-[#C5A880] font-semibold text-sm shadow-inner"
                    />
                  </div>
                </div>

                {otpError && <p className="text-[11px] text-red-400 font-semibold">{otpError}</p>}

                <button 
                  type="submit" 
                  disabled={isSendingOtp}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-3.5 rounded-2xl font-black uppercase tracking-wider hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,168,128,0.3)]"
                >
                  {isSendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending SMS...</> : "Send Real SMS OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div className="bg-black/50 border border-white/15 p-3.5 rounded-2xl text-center space-y-1 shadow-inner">
                  <div className="flex items-center justify-center gap-1.5 text-[#C5A880] font-bold text-xs">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>OTP Sent to +91 {phoneNumber}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Enter the 6-digit code received on your phone</p>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Enter SMS OTP</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    required 
                    placeholder="••••••" 
                    value={enteredOtp} 
                    onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 text-center text-xl font-mono tracking-[0.3em] bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] font-bold shadow-inner"
                  />
                </div>

                {otpError && <p className="text-[11px] text-red-400 font-semibold">{otpError}</p>}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setAuthStep("phone"); setOtpError(""); }} className="w-1/3 bg-white/10 text-gray-300 py-3 rounded-2xl font-semibold hover:bg-white/20 cursor-pointer transition border border-white/10">Change</button>
                  <button 
                    type="submit" 
                    disabled={isVerifyingOtp}
                    className="w-2/3 bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-3 rounded-2xl font-black uppercase tracking-wider hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(197,168,128,0.3)]"
                  >
                    {isVerifyingOtp ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify & Sign In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile & Tracking Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121218] text-white rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative space-y-5 max-h-[90vh] overflow-hidden flex flex-col border border-white/15">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-[#C5A880] shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{customerUser?.name || "Trovella Member"}</h3>
                  <p className="text-[11px] text-gray-400">+91 {customerUser?.phone}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer p-2 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setProfileTab("details")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  profileTab === "details" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                Delivery Address
              </button>
              <button 
                onClick={() => setProfileTab("orders")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === "orders" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>My Orders ({customerOrders.length})</span>
              </button>
            </div>

            {profileTab === "details" && (
              <div className="space-y-3.5 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Full Name</label>
                  <input type="text" placeholder="Your Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-300">Saved Address</label>
                  <textarea rows={2} placeholder="Flat, Street, Area..." value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">City</label>
                    <input type="text" placeholder="City" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-gray-300">Pincode</label>
                    <input type="text" placeholder="Pincode" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})} className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:border-[#C5A880] shadow-inner" />
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      const updated = { ...customerUser, name: customer.name, address: customer.address, city: customer.city, pincode: customer.pincode };
                      setCustomerUser(updated);
                      localStorage.setItem("trovella_customer", JSON.stringify(updated));
                      alert("Profile updated successfully!");
                      setIsProfileModalOpen(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#C5A880] to-[#dfc49c] text-black py-3 rounded-2xl font-black uppercase tracking-wider hover:brightness-110 transition cursor-pointer shadow-[0_0_20px_rgba(197,168,128,0.3)]"
                  >
                    Save Details
                  </button>
                  <button onClick={handleCustomerLogout} className="p-3 bg-red-950/50 text-red-400 border border-red-500/30 rounded-2xl hover:bg-red-900/50 transition cursor-pointer shadow-sm" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {profileTab === "orders" && (
              <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
                {loadingOrders ? (
                  <div className="text-center py-16 text-xs text-gray-400 font-semibold">
                    <Clock className="w-6 h-6 mx-auto mb-2 animate-spin text-[#C5A880]" />
                    Fetching your orders...
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
                    <p className="text-xs font-semibold text-gray-300">No orders placed yet</p>
                    <p className="text-[10px] text-gray-500">Your purchased jewels will appear here.</p>
                  </div>
                ) : (
                  customerOrders.map((ord) => {
                    const currentStageIdx = getStageIndex(ord.status || "Order Placed");
                    const isCancellable = ["Order Placed", "Pending", "Processing"].includes(ord.status);
                    const isReturnable = ord.status === "Delivered";

                    return (
                      <div key={ord.id} className="p-4 bg-black/50 rounded-3xl border border-white/10 space-y-3.5 text-xs shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-gray-500 font-bold">Order ID #{ord.id}</span>
                            <h4 className="font-bold text-white mt-0.5">₹{ord.total_amount} • {ord.payment_method}</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                            ord.status === "Delivered" ? "bg-green-950/60 text-green-400 border border-green-500/30" :
                            ord.status === "Shipped / In Transit" ? "bg-blue-950/60 text-blue-400 border border-blue-500/30" :
                            ord.status === "Cancelled" ? "bg-red-950/60 text-red-400 border border-red-500/30" :
                            "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                          }`}>
                            {ord.status || "Order Placed"}
                          </span>
                        </div>

                        {ord.status !== "Cancelled" && ord.status !== "Return Requested" && (
                          <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10 shadow-inner">
                            <div className="flex items-center justify-between relative">
                              <div className="absolute left-2 right-2 top-3 h-0.5 bg-white/10 z-0" />
                              <div 
                                className="absolute left-2 top-3 h-0.5 bg-green-500 z-0 transition-all duration-500 shadow-[0_0_8px_#22c55e]" 
                                style={{ width: `${(currentStageIdx / (trackingStages.length - 1)) * 95}%` }}
                              />

                              {trackingStages.map((stg, sIdx) => {
                                const isCompleted = sIdx <= currentStageIdx;
                                return (
                                  <div key={sIdx} className="flex flex-col items-center z-10 space-y-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                                      isCompleted ? "bg-green-500 text-black shadow-[0_0_10px_#22c55e]" : "bg-white/10 text-gray-500 border border-white/10"
                                    }`}>
                                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                                    </div>
                                    <span className={`text-[9px] text-center font-medium ${isCompleted ? "text-white font-bold" : "text-gray-500"}`}>
                                      {stg.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {ord.tracking_number && (
                          <div className="bg-blue-950/40 border border-blue-500/30 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                            <div className="text-[11px] text-blue-300">
                              <span className="font-bold">Courier: {ord.courier_name || "BlueDart / Delhivery"}</span>
                              <p className="text-[10px] text-blue-400 font-mono">AWB: {ord.tracking_number}</p>
                            </div>
                            {ord.tracking_url && (
                              <a 
                                href={ord.tracking_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition shadow-md"
                              >
                                Live Map <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        <div className="divide-y divide-white/10 bg-black/40 p-3 rounded-2xl border border-white/10">
                          {ord.items?.map((item: any, idx: number) => (
                            item.title && (
                              <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                                <span className="font-medium text-gray-200 truncate max-w-[200px]">{item.title}</span>
                                <span className="text-gray-400 shrink-0 font-medium">x{item.quantity} (₹{item.price * item.quantity})</span>
                              </div>
                            )
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" /> {ord.address}, {ord.city}
                          </p>

                          <div className="flex gap-2">
                            {isCancellable && (
                              <button
                                onClick={() => setCancelModalOrderId(ord.id)}
                                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition shadow-sm"
                              >
                                Cancel Order
                              </button>
                            )}

                            {isReturnable && (
                              <button
                                onClick={() => setReturnModalOrderId(ord.id)}
                                className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition shadow-sm flex items-center gap-1"
                              >
                                <ReturnIcon className="w-3 h-3" /> Return Order
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] text-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-white/20 space-y-4">
            <h3 className="font-serif font-bold text-lg text-white">Cancel Order</h3>
            <p className="text-xs text-gray-400">Please let us know why you are cancelling this order:</p>
            <textarea
              rows={3}
              placeholder="e.g. Ordered by mistake, found cheaper elsewhere..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleCustomerCancelOrder(cancelModalOrderId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Reason Modal */}
      {returnModalOrderId && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] text-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-white/20 space-y-4">
            <h3 className="font-serif font-bold text-lg text-white">Return Order</h3>
            <p className="text-xs text-gray-400">Please provide a reason for returning this item:</p>
            <textarea
              rows={3}
              placeholder="e.g. Size issue, damaged item, different color received..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReturnModalOrderId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleCustomerReturnOrder(returnModalOrderId)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}