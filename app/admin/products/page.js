"use client";

import { useEffect, useState } from "react";
import { Search, Package, Plus, X, Clock, Edit2, Upload, Trash2, CheckCircle2, AlertCircle, CheckSquare2, Square, RotateCcw, RefreshCw } from "lucide-react";
import { API_BASE } from "@/lib/config";

// Helper to fix Google Drive image preview URLs to render in <img> tags
const getGoogleDriveThumbnail = (url) => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (!trimmedUrl.includes('drive.google.com')) return trimmedUrl;
  
  let fileId = '';
  // Format 1: /file/d/FILE_ID/...
  const fileDMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  } else {
    // Format 2: ?id=FILE_ID or &id=FILE_ID
    const idMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
  }
  return trimmedUrl;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter State
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'posted' | 'deleted'

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({
    Title: "",
    vendor: "",
    Handle: "",
    "Variant Price": "",
    "Body (HTML)": "",
    status: "pending",
  });
  const [addFiles, setAddFiles] = useState([]); // Array of { name, type, preview, data }

  // Edit Product State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // The product currently being edited
  const [existingImages, setExistingImages] = useState([]); // Images currently on the server for this product
  const [editFiles, setEditFiles] = useState([]); // Newly added image files { name, type, preview, data }
  
  // Drag and drop helper states
  const [isDragActiveAdd, setIsDragActiveAdd] = useState(false);
  const [isDragActiveEdit, setIsDragActiveEdit] = useState(false);

  // Selection & Delete State
  const [selectedHandles, setSelectedHandles] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { handle, title } or 'bulk'
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Edit States
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditTarget, setBulkEditTarget] = useState("selected"); // 'selected' | 'filtered' | 'all'
  const [bulkEditLimitEnabled, setBulkEditLimitEnabled] = useState(false);
  const [bulkEditLimit, setBulkEditLimit] = useState("");
  
  // Match counts for Find & Replace fields
  const [titleMatchCount, setTitleMatchCount] = useState(null);
  const [titleMatchLoading, setTitleMatchLoading] = useState(false);
  const [vendorMatchCount, setVendorMatchCount] = useState(null);
  const [vendorMatchLoading, setVendorMatchLoading] = useState(false);
  const [bodyMatchCount, setBodyMatchCount] = useState(null);
  const [bodyMatchLoading, setBodyMatchLoading] = useState(false);

  const [bulkEditParams, setBulkEditParams] = useState({
    Title: { enabled: false, type: "set_value", value: "", find: "", replace: "", regenerateHandle: false },
    vendor: { enabled: false, type: "set_value", value: "", find: "", replace: "" },
    price: { enabled: false, type: "set_value", value: "" },
    status: { enabled: false, type: "set_value", value: "pending" },
    bodyHtml: { enabled: false, type: "set_value", value: "", find: "", replace: "" },
    stockCount: { enabled: false, type: "set_value", value: "10" }
  });

  // Import/Export States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importProductsData, setImportProductsData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importUpdateExisting, setImportUpdateExisting] = useState(true);
  const [importDragActive, setImportDragActive] = useState(false);
  const [importFilterKeyword, setImportFilterKeyword] = useState("");

  const [exportTarget, setExportTarget] = useState("all"); // 'all' | 'filtered' | 'selected'
  const [exportDomain, setExportDomain] = useState("https://chainandstrap.store");
  const [exportBoard, setExportBoard] = useState("Chain & Straps");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMigratedOnly, setExportMigratedOnly] = useState(true);
  const [migratedCount, setMigratedCount] = useState(0);
  const [loadingMigratedCount, setLoadingMigratedCount] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => {
        if (prev && prev.message === message) return null;
        return prev;
      });
    }, 4000);
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: 25,
        page,
        search: encodeURIComponent(search),
      });
      if (statusFilter === 'deleted') {
        params.set('deleted', 'true');
      } else if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, search ? 400 : 0);

    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  // Fetch migrated products count when export modal is opened
  useEffect(() => {
    if (showExportModal) {
      const fetchMigratedCount = async () => {
        setLoadingMigratedCount(true);
        try {
          const token = localStorage.getItem("cs_token");
          const res = await fetch(`${API_BASE}/products/count-match?field=Image%20Src&find=digitaloceanspaces.com`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setMigratedCount(data.count || 0);
          }
        } catch (err) {
          console.error("Failed to fetch migrated count", err);
        } finally {
          setLoadingMigratedCount(false);
        }
      };
      fetchMigratedCount();
    }
  }, [showExportModal]);

  // File conversion helper (converts files to base64)
  const processFiles = (files, setFilesCallback) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Only image files are allowed!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilesCallback((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            preview: URL.createObjectURL(file),
            data: reader.result, // Base64 string
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Modal File Handlers
  const handleAddFilesChange = (e) => {
    processFiles(e.target.files, setAddFiles);
  };

  const handleAddDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActiveAdd(true);
    } else if (e.type === "dragleave") {
      setIsDragActiveAdd(false);
    }
  };

  const handleAddDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActiveAdd(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files, setAddFiles);
    }
  };

  const removeAddFile = (index) => {
    setAddFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Edit Modal File Handlers
  const handleEditFilesChange = (e) => {
    processFiles(e.target.files, setEditFiles);
  };

  const handleEditDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActiveEdit(true);
    } else if (e.type === "dragleave") {
      setIsDragActiveEdit(false);
    }
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActiveEdit(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files, setEditFiles);
    }
  };

  const removeEditFile = (index) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.Title || !newProduct.Handle || !newProduct["Variant Price"]) {
      showToast("Title, Handle, and Price are required.", "error");
      return;
    }

    setProductSaving(true);
    try {
      const token = localStorage.getItem("cs_token");
      let uploadedUrls = [];

      // 1. Upload files if selected
      if (addFiles.length > 0) {
        const uploadRes = await fetch(`${API_BASE}/admin/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            files: addFiles.map((f) => ({ name: f.name, type: f.type, data: f.data })),
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Failed to upload images");
        }
        uploadedUrls = uploadData.urls || [];
      }

      // 2. Create Product
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProduct,
          "Image Src": uploadedUrls.join(", "),
          images: uploadedUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      showToast("Product added successfully!", "success");
      setShowAddModal(false);
      setAddFiles([]);
      setNewProduct({
        Title: "",
        vendor: "",
        Handle: "",
        "Variant Price": "",
        "Body (HTML)": "",
        status: "pending",
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to add product", "error");
    } finally {
      setProductSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditProduct(product);
    
    // Parse existing images — aggregation pushes Image Src strings (filter out empty)
    let images = [];
    if (Array.isArray(product.images)) {
      images = product.images.filter(Boolean).map(url => url.split(",")[0].trim()).filter(Boolean);
    } else if (product["Image Src"]) {
      images = product["Image Src"].split(",").map((url) => url.trim()).filter(Boolean);
    }
    setExistingImages(images);
    setEditFiles([]);
    setShowEditModal(true);
  };

  // Handle Edit Product Submit
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editProduct.Title || !editProduct.Handle || !editProduct["Variant Price"]) {
      showToast("Title, Handle, and Price are required.", "error");
      return;
    }

    setProductSaving(true);
    try {
      const token = localStorage.getItem("cs_token");
      let uploadedUrls = [];

      // 1. Upload new files if selected
      if (editFiles.length > 0) {
        const uploadRes = await fetch(`${API_BASE}/admin/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            files: editFiles.map((f) => ({ name: f.name, type: f.type, data: f.data })),
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Failed to upload images");
        }
        uploadedUrls = uploadData.urls || [];
      }

      // Merge remaining existing images with new uploads
      const finalImagesArray = [...existingImages, ...uploadedUrls];

      // 2. Update Product — prefer mongoId (real ObjectId), fall back to Handle
      const productIdForApi = editProduct.mongoId || editProduct.Handle;
      const res = await fetch(`${API_BASE}/products/${productIdForApi}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Title: editProduct.Title,
          vendor: editProduct.vendor || "",
          Handle: editProduct.Handle,
          "Variant Price": editProduct["Variant Price"],
          "Body (HTML)": editProduct["Body (HTML)"] || "",
          status: editProduct.status || "pending",
          "Image Src": finalImagesArray.join(", "),
          images: finalImagesArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      showToast("Product updated successfully!", "success");
      setShowEditModal(false);
      setEditFiles([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update product", "error");
    } finally {
      setProductSaving(false);
    }
  };

  // ── Selection helpers ──────────────────────────────────────────────
  const toggleSelect = (handle) => {
    setSelectedHandles((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedHandles.size === products.length) {
      setSelectedHandles(new Set());
    } else {
      setSelectedHandles(new Set(products.map((p) => p.Handle || p._id)));
    }
  };

  // ── Single Delete ──────────────────────────────────────────────────
  const handleDeleteProduct = async () => {
    if (!confirmDelete || confirmDelete === "bulk") return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("cs_token");
      const productId = confirmDelete.mongoId || confirmDelete.handle;
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");
      showToast("Product deleted successfully!", "success");
      setConfirmDelete(null);
      setSelectedHandles((prev) => { const next = new Set(prev); next.delete(confirmDelete.handle); return next; });
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Bulk Delete ────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedHandles.size === 0) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/products`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handles: Array.from(selectedHandles) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Bulk delete failed");
      showToast(`${data.count || selectedHandles.size} products deleted!`, "success");
      setConfirmDelete(null);
      setSelectedHandles(new Set());
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Bulk delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Bulk Status Update ─────────────────────────────────────────────
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedHandles.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const token = localStorage.getItem("cs_token");
      const results = await Promise.all(
        Array.from(selectedHandles).map((handle) =>
          fetch(`${API_BASE}/products/${handle}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) showToast(`${failed} products failed to update`, "error");
      else showToast(`${selectedHandles.size} products marked as ${newStatus}!`, "success");
      setSelectedHandles(new Set());
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Bulk status update failed", "error");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // ── Single Restore ─────────────────────────────────────────────────
  const handleRestoreProduct = async (productId) => {
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/products/${productId}/restore`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Restore failed");
      showToast("Product restored successfully!", "success");
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Restore failed", "error");
    }
  };

  // ── Bulk Edit Submit ───────────────────────────────────────────────
  const handleBulkEditSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsBulkEditing(true);
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/products/bulk-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: bulkEditTarget,
          limit: bulkEditLimitEnabled && bulkEditLimit ? parseInt(bulkEditLimit) : null,
          handles: Array.from(selectedHandles),
          filters: {
            search,
            status: statusFilter,
          },
          updates: bulkEditParams
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Bulk edit failed");
      showToast(data.message || `${data.count} products updated!`, "success");
      setShowBulkEditModal(false);
      setSelectedHandles(new Set());
      
      // Reset targets & params
      setBulkEditTarget("selected");
      setBulkEditLimitEnabled(false);
      setBulkEditLimit("");
      setBulkEditParams({
        Title: { enabled: false, type: "set_value", value: "", find: "", replace: "", regenerateHandle: false },
        vendor: { enabled: false, type: "set_value", value: "", find: "", replace: "" },
        price: { enabled: false, type: "set_value", value: "" },
        status: { enabled: false, type: "set_value", value: "pending" },
        bodyHtml: { enabled: false, type: "set_value", value: "", find: "", replace: "" },
        stockCount: { enabled: false, type: "set_value", value: "10" }
      });
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Bulk edit failed", "error");
    } finally {
      setIsBulkEditing(false);
    }
  };

  // Query Match Counts
  const queryMatchCount = async (field, find, setCount, setLoading) => {
    if (!find.trim()) {
      setCount(null);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/products/count-match?field=${field}&find=${encodeURIComponent(find)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced query for Title matching count
  useEffect(() => {
    if (bulkEditParams.Title.enabled && bulkEditParams.Title.type === 'replace_text') {
      const timer = setTimeout(() => {
        queryMatchCount('Title', bulkEditParams.Title.find, setTitleMatchCount, setTitleMatchLoading);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setTitleMatchCount(null);
    }
  }, [bulkEditParams.Title.find, bulkEditParams.Title.enabled, bulkEditParams.Title.type]);

  // Debounced query for Vendor matching count
  useEffect(() => {
    if (bulkEditParams.vendor.enabled && bulkEditParams.vendor.type === 'replace_text') {
      const timer = setTimeout(() => {
        queryMatchCount('vendor', bulkEditParams.vendor.find, setVendorMatchCount, setVendorMatchLoading);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setVendorMatchCount(null);
    }
  }, [bulkEditParams.vendor.find, bulkEditParams.vendor.enabled, bulkEditParams.vendor.type]);

  // Debounced query for Description matching count
  useEffect(() => {
    if (bulkEditParams.bodyHtml.enabled && bulkEditParams.bodyHtml.type === 'replace_text') {
      const timer = setTimeout(() => {
        queryMatchCount('bodyHtml', bulkEditParams.bodyHtml.find, setBodyMatchCount, setBodyMatchLoading);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setBodyMatchCount(null);
    }
  }, [bulkEditParams.bodyHtml.find, bulkEditParams.bodyHtml.enabled, bulkEditParams.bodyHtml.type]);

  // ── CSV Import Handlers ──────────────────────────────────────────
  const getFilteredImportProducts = () => {
    if (!importFilterKeyword.trim()) return importProductsData;
    const kw = importFilterKeyword.trim().toLowerCase();
    return importProductsData.filter(item => {
      return Object.values(item).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(kw)
      );
    });
  };

  const handleCSVFileParse = (text) => {
    try {
      const lines = [];
      let row = [""];
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i+1];
        if (c === '"') {
          if (inQuotes && next === '"') {
            row[row.length - 1] += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
          if (c === '\r' && next === '\n') {
            i++;
          }
          lines.push(row);
          row = [''];
        } else {
          row[row.length - 1] += c;
        }
      }
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      if (lines.length === 0) {
        showToast("The selected CSV file is empty.", "error");
        return;
      }
      
      const headers = lines[0].map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      // Validate headers
      const hasHandle = headers.some(h => h.toLowerCase() === 'handle');
      const hasTitle = headers.some(h => h.toLowerCase() === 'title');
      
      if (!hasHandle || !hasTitle) {
        showToast("CSV must contain at least 'Handle' and 'Title' columns.", "error");
        return;
      }

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        if (values.length < headers.length) continue;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = (values[index] || '').trim();
        });
        
        // Ensure handle and title exist in this row
        const rowHandle = obj['Handle'] || obj['handle'];
        const rowTitle = obj['Title'] || obj['title'];
        if (rowHandle && rowTitle) {
          parsed.push(obj);
        }
      }

      if (parsed.length === 0) {
        showToast("No valid product rows (with Handle and Title) found in CSV.", "error");
        return;
      }

      setImportProductsData(parsed);
      showToast(`Successfully parsed ${parsed.length} products from CSV!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to parse CSV file.", "error");
    }
  };

  const handleImportDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImportDragActive(true);
    } else if (e.type === "dragleave") {
      setImportDragActive(false);
    }
  };

  const handleImportDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImportDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.csv')) {
        showToast("Only CSV files are supported.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCSVFileParse(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleImportFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.csv')) {
        showToast("Only CSV files are supported.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCSVFileParse(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleImportSubmit = async () => {
    const productsToImport = getFilteredImportProducts();
    if (productsToImport.length === 0) return;
    setImportLoading(true);
    setImportProgress(0);
    
    const batchSize = 500;
    const token = localStorage.getItem("cs_token");
    let totalImported = 0;
    let newCount = 0;
    let updateCount = 0;

    try {
      for (let i = 0; i < productsToImport.length; i += batchSize) {
        const chunk = productsToImport.slice(i, i + batchSize);
        const res = await fetch(`${API_BASE}/products/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: chunk,
            updateExisting: importUpdateExisting
          })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Bulk import chunk failed");
        
        newCount += (data.newCount || 0);
        updateCount += (data.updateCount || 0);
        totalImported += chunk.length;
        
        const progressPercent = Math.min(100, Math.round((totalImported / productsToImport.length) * 100));
        setImportProgress(progressPercent);
      }
      
      showToast(`Import complete! Created ${newCount} products, updated ${updateCount} products.`, "success");
      setShowImportModal(false);
      setImportProductsData([]);
      setImportFilterKeyword("");
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to import products.", "error");
    } finally {
      setImportLoading(false);
      setImportProgress(0);
    }
  };

  // ── CSV Pinterest Export Handlers ────────────────────────────────
  const handleExportSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsExporting(true);
    try {
      const token = localStorage.getItem("cs_token");
      const params = new URLSearchParams({
        target: exportTarget,
        domain: exportDomain,
        board: exportBoard,
        migratedOnly: exportMigratedOnly ? 'true' : 'false'
      });

      if (exportTarget === 'selected') {
        params.set('handles', Array.from(selectedHandles).join(','));
      } else if (exportTarget === 'filtered') {
        params.set('status', statusFilter);
        params.set('search', search);
      }

      const res = await fetch(`${API_BASE}/products/export/pinterest?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to export Pinterest CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinterest_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast("Pinterest CSV exported successfully!", "success");
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to export Pinterest CSV.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-light tracking-wide">Products</h1>
        <p className="text-[#666] text-sm mt-1">
          {loading ? "..." : totalProducts.toLocaleString()} products in store
        </p>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            placeholder="Search products by title or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#111] border border-[#222] text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8972e] transition-colors placeholder-[#444] rounded"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center bg-[#161616] hover:bg-[#222] border border-[#222] hover:border-[#333] text-white font-semibold px-4 py-3 rounded text-sm transition-colors cursor-pointer select-none"
          >
            <Upload size={16} className="mr-2 text-[#b8972e]" /> Import CSV
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center bg-[#161616] hover:bg-[#222] border border-[#222] hover:border-[#333] text-white font-semibold px-4 py-3 rounded text-sm transition-colors cursor-pointer select-none"
          >
            <Package size={16} className="mr-2 text-[#b8972e]" /> Export Pinterest CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center bg-[#b8972e] hover:bg-[#a68524] text-black font-semibold px-5 py-3 rounded text-sm transition-colors cursor-pointer select-none"
          >
            <Plus size={16} className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Products' },
          { key: 'pending', label: '⏳ Pending' },
          { key: 'posted', label: '✅ Posted' },
          { key: 'deleted', label: '🗑 Deleted' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); setSelectedHandles(new Set()); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === tab.key
                ? 'bg-[#b8972e] border-[#b8972e] text-black'
                : 'bg-transparent border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selectedHandles.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1a1100] border border-[#b8972e]/30 rounded-lg px-5 py-3 mb-4 animate-toast-in">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#b8972e] animate-pulse" />
            <span className="text-[#b8972e] text-sm font-semibold">{selectedHandles.size} product{selectedHandles.size > 1 ? 's' : ''} selected</span>
            <button onClick={() => setSelectedHandles(new Set())} className="text-[#555] hover:text-white text-xs transition-colors ml-1 cursor-pointer">
              Deselect all
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('pending')}
              disabled={isBulkUpdating}
              className="flex items-center gap-1.5 bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700/30 text-yellow-400 font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <Clock size={12} /> Mark Pending
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('posted')}
              disabled={isBulkUpdating}
              className="flex items-center gap-1.5 bg-green-900/40 hover:bg-green-800/60 border border-green-700/30 text-green-400 font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={12} /> Mark Posted
            </button>
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="flex items-center gap-1.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/30 text-blue-400 font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer"
            >
              <Edit2 size={12} /> Bulk Edit
            </button>
            <button
              onClick={() => setConfirmDelete('bulk')}
              className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Delete {selectedHandles.size}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs animate-pulse">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedHandles.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#333] bg-transparent text-[#b8972e] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#b8972e]"
                    />
                  </th>
                  <th className="text-left px-4 py-4 text-[#555] text-xs tracking-widest uppercase">Product</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widests uppercase">Brand</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Price</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const images = Array.isArray(product.images) ? product.images : [];
                  const image = images.filter(Boolean)[0] || product["Image Src"] || null;
                  const title = product.Title || product.title || "Untitled";
                  const vendor = product.Vendor || product.vendor || "—";
                  const price = product["Variant Price"] || product.price || 0;
                  const handle = product.Handle || product.handle || product._id;
                  const status = product.status || "pending";
                  const isSelected = selectedHandles.has(handle);

                  return (
                    <tr key={product._id} className={`border-b border-[#1a1a1a] transition-colors ${
                      isSelected ? 'bg-[#b8972e]/5 border-l-2 border-l-[#b8972e]/40' : 'hover:bg-white/[0.02]'
                    }`}>
                      <td className="px-4 py-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(handle)}
                          className="w-4 h-4 rounded border-[#333] bg-transparent text-[#b8972e] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#b8972e]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img 
                              src={getGoogleDriveThumbnail(image.split(",")[0].trim())} 
                              alt={title} 
                              referrerPolicy="no-referrer" 
                              className="w-10 h-12 object-cover flex-shrink-0 bg-[#0a0a0a]" 
                            />
                          ) : (
                            <div className="w-10 h-12 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-[#444]" />
                            </div>
                          )}
                          <p className="text-white text-sm line-clamp-1">{title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#b8972e] text-xs tracking-wider uppercase">{vendor}</td>
                      <td className="px-6 py-4 text-white text-sm">${Number(price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {(() => {
                          let badgeClass = 'bg-yellow-900/20 border-yellow-700/20 text-yellow-500';
                          let Icon = Clock;
                          if (status === 'posted' || status === 'success') {
                            badgeClass = 'bg-green-900/30 border-green-700/30 text-green-400';
                            Icon = CheckCircle2;
                          } else if (status === 'active') {
                            badgeClass = 'bg-blue-900/30 border-blue-700/30 text-blue-400';
                            Icon = Package;
                          } else if (status === 'failed') {
                            badgeClass = 'bg-red-900/30 border-red-700/30 text-red-400';
                            Icon = AlertCircle;
                          }
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                              <Icon size={10} />
                              {status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {statusFilter === 'deleted' ? (
                            <button
                              onClick={() => handleRestoreProduct(product.mongoId || handle)}
                              className="p-2 hover:bg-green-900/30 rounded text-green-500/70 hover:text-green-400 transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <RotateCcw size={14} /> Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-2 hover:bg-[#222] rounded text-[#b8972e] hover:text-white transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmDelete({ handle, title, mongoId: product.mongoId })}
                                className="p-2 hover:bg-red-900/30 rounded text-red-500/60 hover:text-red-400 transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#222] bg-[#111]">
            <div className="text-[#555] text-xs">
              Showing {(page - 1) * 25 + 1} to {Math.min(page * 25, totalProducts)} of {totalProducts.toLocaleString()} products
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-[#161616] border border-[#222] text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs cursor-pointer font-medium"
              >
                Previous
              </button>
              <span className="text-[#888] text-xs font-mono">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-[#161616] border border-[#222] text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0d0d0d] rounded-lg max-w-2xl w-full border border-[#222] overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
              <div className="flex items-center space-x-2">
                <Package className="text-[#b8972e] w-5 h-5" />
                <h3 className="text-lg font-light text-white tracking-wide">Add New Product</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddFiles([]);
                }}
                className="text-[#666] hover:text-white transition-colors text-xl cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Louis Vuitton OnTheGo PM Monogram"
                    value={newProduct.Title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const handle = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "");
                      setNewProduct((prev) => ({
                        ...prev,
                        Title: title,
                        Handle: handle,
                      }));
                    }}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Handle */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">URL Handle (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. louis-vuitton-onthego-pm"
                    value={newProduct.Handle}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, Handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Vendor / Brand */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Brand / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Louis Vuitton"
                    value={newProduct.vendor}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, vendor: e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#555] text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="250.00"
                      value={newProduct["Variant Price"]}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, "Variant Price": e.target.value }))}
                      className="w-full bg-[#161616] border border-[#222] text-white rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Pinterest Bot Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors bg-[#161616]"
                  >
                    <option value="pending">Pending (Will be posted by bot)</option>
                    <option value="posted">Posted (Skip bot posting)</option>
                  </select>
                </div>

                {/* Image Upload Dropzone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Upload Product Images *</label>
                  <div
                    onDragEnter={handleAddDrag}
                    onDragOver={handleAddDrag}
                    onDragLeave={handleAddDrag}
                    onDrop={handleAddDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActiveAdd ? "border-[#b8972e] bg-[#b8972e]/5" : "border-[#333] hover:border-[#444] bg-[#161616]"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddFilesChange}
                      className="hidden"
                      id="add-file-input"
                    />
                    <label htmlFor="add-file-input" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-[#b8972e] mx-auto mb-2" />
                      <p className="text-white text-sm font-light">Drag & drop images here, or <span className="text-[#b8972e] font-semibold hover:underline">browse</span></p>
                      <p className="text-[#555] text-xs mt-1">Supports multiple JPEG, PNG, or WebP images</p>
                    </label>
                  </div>

                  {/* Selected Images Previews */}
                  {addFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {addFiles.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-24 border border-[#333] rounded overflow-hidden bg-[#111]">
                          <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeAddFile(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Description (HTML / Text)</label>
                  <textarea
                    rows="4"
                    placeholder="Product description..."
                    value={newProduct["Body (HTML)"]}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, "Body (HTML)": e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors font-sans"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#222] flex justify-end space-x-3 bg-[#0d0d0d] sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddFiles([]);
                  }}
                  className="px-4 py-2 border border-[#222] rounded text-sm font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSaving || addFiles.length === 0}
                  className="flex items-center justify-center bg-[#b8972e] hover:bg-[#a68524] text-black font-semibold px-5 py-2 rounded text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {productSaving ? (
                    <>
                      <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0d0d0d] rounded-lg max-w-2xl w-full border border-[#222] overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
              <div className="flex items-center space-x-2">
                <Package className="text-[#b8972e] w-5 h-5" />
                <h3 className="text-lg font-light text-white tracking-wide">Edit Product</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFiles([]);
                }}
                className="text-[#666] hover:text-white transition-colors text-xl cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Louis Vuitton OnTheGo PM Monogram"
                    value={editProduct.Title}
                    onChange={(e) => setEditProduct((prev) => ({ ...prev, Title: e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Handle */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">URL Handle (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. louis-vuitton-onthego-pm"
                    value={editProduct.Handle}
                    onChange={(e) => setEditProduct((prev) => ({ ...prev, Handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Vendor / Brand */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Brand / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Louis Vuitton"
                    value={editProduct.vendor || ""}
                    onChange={(e) => setEditProduct((prev) => ({ ...prev, vendor: e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#555] text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="250.00"
                      value={editProduct["Variant Price"]}
                      onChange={(e) => setEditProduct((prev) => ({ ...prev, "Variant Price": e.target.value }))}
                      className="w-full bg-[#161616] border border-[#222] text-white rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Pinterest Bot Status</label>
                  <select
                    value={editProduct.status || "pending"}
                    onChange={(e) => setEditProduct((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors bg-[#161616]"
                  >
                    <option value="pending">Pending (Will be posted by bot)</option>
                    <option value="posted">Posted (Skip bot posting)</option>
                  </select>
                </div>

                {/* Existing Images */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Existing Product Images</label>
                  {existingImages.length === 0 ? (
                    <p className="text-[#555] text-xs">No images currently uploaded</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-3 mt-1">
                      {existingImages.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-24 border border-[#333] rounded overflow-hidden bg-[#111]">
                          <img 
                            src={getGoogleDriveThumbnail(url)} 
                            alt="existing" 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Images Dropzone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Upload New Images</label>
                  <div
                    onDragEnter={handleEditDrag}
                    onDragOver={handleEditDrag}
                    onDragLeave={handleEditDrag}
                    onDrop={handleEditDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActiveEdit ? "border-[#b8972e] bg-[#b8972e]/5" : "border-[#333] hover:border-[#444] bg-[#161616]"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditFilesChange}
                      className="hidden"
                      id="edit-file-input"
                    />
                    <label htmlFor="edit-file-input" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-[#b8972e] mx-auto mb-2" />
                      <p className="text-white text-sm font-light">Drag & drop new images here, or <span className="text-[#b8972e] font-semibold hover:underline">browse</span></p>
                      <p className="text-[#555] text-xs mt-1">Supports JPEG, PNG, or WebP formats</p>
                    </label>
                  </div>

                  {/* Selected New Images Previews */}
                  {editFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {editFiles.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-24 border border-[#333] rounded overflow-hidden bg-[#111]">
                          <img src={file.preview} alt="preview new" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeEditFile(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-1">Description (HTML / Text)</label>
                  <textarea
                    rows="4"
                    placeholder="Product description..."
                    value={editProduct["Body (HTML)"] || ""}
                    onChange={(e) => setEditProduct((prev) => ({ ...prev, "Body (HTML)": e.target.value }))}
                    className="w-full bg-[#161616] border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b8972e] transition-colors font-sans"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#222] flex justify-end space-x-3 bg-[#0d0d0d] sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFiles([]);
                  }}
                  className="px-4 py-2 border border-[#222] rounded text-sm font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSaving || (existingImages.length === 0 && editFiles.length === 0)}
                  className="flex items-center justify-center bg-[#b8972e] hover:bg-[#a68524] text-black font-semibold px-5 py-2 rounded text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {productSaving ? (
                    <>
                      <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#0d0d0d] border border-red-500/20 rounded-xl max-w-md w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-toast-in">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-light text-center tracking-wide mb-2">
              {confirmDelete === 'bulk'
                ? `Delete ${selectedHandles.size} Products?`
                : 'Delete Product?'}
            </h3>

            {/* Description */}
            <p className="text-[#555] text-sm text-center leading-relaxed mb-6">
              {confirmDelete === 'bulk' ? (
                <>You are about to delete <span className="text-red-400 font-semibold">{selectedHandles.size} products</span>. This action cannot be undone.</>
              ) : (
                <>You are about to delete <span className="text-white font-medium line-clamp-1">&ldquo;{confirmDelete.title}&rdquo;</span>. This action cannot be undone.</>
              )}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-[#222] rounded-lg text-sm font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete === 'bulk' ? handleBulkDelete : handleDeleteProduct}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <><Clock className="animate-spin h-4 w-4" /> Deleting...</>
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-[#111] border border-[#222] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col animate-toast-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
              <div>
                <h3 className="text-white text-base font-medium tracking-wide">Bulk Edit Products</h3>
                <p className="text-[#666] text-xs mt-0.5">{selectedHandles.size} products selected for modification</p>
              </div>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="text-[#666] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleBulkEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Target & Limit Configuration */}
              <div className="bg-[#181818] border border-[#2c2c2c] p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wider">1. Apply Changes To:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="bulkTarget"
                        value="selected"
                        checked={bulkEditTarget === 'selected'}
                        onChange={(e) => setBulkEditTarget(e.target.value)}
                        className="accent-[#b8972e]"
                      />
                      <span>Selected Rows ({selectedHandles.size})</span>
                    </label>
                    <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="bulkTarget"
                        value="filtered"
                        checked={bulkEditTarget === 'filtered'}
                        onChange={(e) => setBulkEditTarget(e.target.value)}
                        className="accent-[#b8972e]"
                      />
                      <span>Filtered/Search Results</span>
                    </label>
                    <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="bulkTarget"
                        value="all"
                        checked={bulkEditTarget === 'all'}
                        onChange={(e) => setBulkEditTarget(e.target.value)}
                        className="accent-[#b8972e]"
                      />
                      <span>All {totalProducts.toLocaleString()} Products</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-[#2c2c2c] pt-3 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-white font-medium text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditLimitEnabled}
                      onChange={(e) => setBulkEditLimitEnabled(e.target.checked)}
                      className="accent-[#b8972e]"
                    />
                    Limit to first:
                  </label>
                  {bulkEditLimitEnabled && (
                    <input
                      type="number"
                      value={bulkEditLimit}
                      onChange={(e) => setBulkEditLimit(e.target.value)}
                      placeholder="e.g. 300, 500"
                      min="1"
                      required
                      className="bg-[#111] border border-[#333] text-white px-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#b8972e] w-32"
                    />
                  )}
                </div>
              </div>

              <p className="text-[#888] text-xs leading-relaxed bg-[#161616] border border-[#222] p-3 rounded">
                Check the box next to any field below you want to modify. Unchecked fields will remain unchanged.
              </p>

              {/* 1. Title */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.Title.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.Title.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        Title: { ...p.Title, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Title
                  </label>
                </div>
                {bulkEditParams.Title.enabled && (
                  <div className="space-y-3 pl-6 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Action</label>
                        <select
                          value={bulkEditParams.Title.type}
                          onChange={(e) => setBulkEditParams(p => ({
                            ...p,
                            Title: { ...p.Title, type: e.target.value }
                          }))}
                          className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] cursor-pointer"
                        >
                          <option value="set_value">Set to specific value</option>
                          <option value="replace_text">Find & Replace text</option>
                          <option value="prepend">Prepend text</option>
                          <option value="append">Append text</option>
                        </select>
                      </div>
                      {bulkEditParams.Title.type === 'replace_text' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Find</label>
                            <input
                              type="text"
                              value={bulkEditParams.Title.find}
                              onChange={(e) => setBulkEditParams(p => ({
                                ...p,
                                Title: { ...p.Title, find: e.target.value }
                              }))}
                              placeholder="Find text..."
                              required
                              className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                            />
                            {titleMatchLoading ? (
                              <p className="text-[10px] text-[#888] mt-1 animate-pulse">Checking database...</p>
                            ) : titleMatchCount !== null ? (
                              <p className="text-[10px] text-[#b8972e] mt-1 font-medium">
                                🔍 Found {titleMatchCount.toLocaleString()} matching products in database
                              </p>
                            ) : null}
                          </div>
                          <div>
                            <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Replace</label>
                            <input
                              type="text"
                              value={bulkEditParams.Title.replace}
                              onChange={(e) => setBulkEditParams(p => ({
                                ...p,
                                Title: { ...p.Title, replace: e.target.value }
                              }))}
                              placeholder="Replace..."
                              className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Value</label>
                          <input
                            type="text"
                            value={bulkEditParams.Title.value}
                            onChange={(e) => setBulkEditParams(p => ({
                              ...p,
                              Title: { ...p.Title, value: e.target.value }
                            }))}
                            placeholder={
                              bulkEditParams.Title.type === 'prepend' ? 'Text to prepend...' :
                              bulkEditParams.Title.type === 'append' ? 'Text to append...' : 'New title value...'
                            }
                            required
                            className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                          />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-[#aaa] text-xs cursor-pointer select-none mt-2">
                      <input
                        type="checkbox"
                        checked={bulkEditParams.Title.regenerateHandle}
                        onChange={(e) => setBulkEditParams(p => ({
                          ...p,
                          Title: { ...p.Title, regenerateHandle: e.target.checked }
                        }))}
                        className="accent-[#b8972e]"
                      />
                      Regenerate URL handles from new titles
                    </label>
                  </div>
                )}
              </div>

              {/* 2. Price */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.price.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.price.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        price: { ...p.price, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Price
                  </label>
                </div>
                {bulkEditParams.price.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 mt-2">
                    <div>
                      <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Action</label>
                      <select
                        value={bulkEditParams.price.type}
                        onChange={(e) => setBulkEditParams(p => ({
                          ...p,
                          price: { ...p.price, type: e.target.value }
                        }))}
                        className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] cursor-pointer"
                      >
                        <option value="set_value">Set price to</option>
                        <option value="adjust_flat">Adjust price flat (+/-)</option>
                        <option value="adjust_percent">Adjust price percentage (+/- %)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Amount / Value</label>
                      <input
                        type="number"
                        step="any"
                        value={bulkEditParams.price.value}
                        onChange={(e) => setBulkEditParams(p => ({
                          ...p,
                          price: { ...p.price, value: e.target.value }
                        }))}
                        placeholder={bulkEditParams.price.type === 'set_value' ? 'e.g. 199.99' : 'e.g. 15 or -10'}
                        required
                        className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Vendor */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.vendor.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.vendor.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        vendor: { ...p.vendor, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Vendor / Brand
                  </label>
                </div>
                {bulkEditParams.vendor.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 mt-2">
                    <div>
                      <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Action</label>
                      <select
                        value={bulkEditParams.vendor.type}
                        onChange={(e) => setBulkEditParams(p => ({
                          ...p,
                          vendor: { ...p.vendor, type: e.target.value }
                        }))}
                        className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] cursor-pointer"
                      >
                        <option value="set_value">Set vendor to</option>
                        <option value="replace_text">Find & Replace text</option>
                      </select>
                    </div>
                    {bulkEditParams.vendor.type === 'replace_text' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Find</label>
                          <input
                            type="text"
                            value={bulkEditParams.vendor.find}
                            onChange={(e) => setBulkEditParams(p => ({
                              ...p,
                              vendor: { ...p.vendor, find: e.target.value }
                            }))}
                            placeholder="Find..."
                            required
                            className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                          />
                          {vendorMatchLoading ? (
                            <p className="text-[10px] text-[#888] mt-1 animate-pulse">Checking database...</p>
                          ) : vendorMatchCount !== null ? (
                            <p className="text-[10px] text-[#b8972e] mt-1 font-medium">
                              🔍 Found {vendorMatchCount.toLocaleString()} matching products in database
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Replace</label>
                          <input
                            type="text"
                            value={bulkEditParams.vendor.replace}
                            onChange={(e) => setBulkEditParams(p => ({
                              ...p,
                              vendor: { ...p.vendor, replace: e.target.value }
                            }))}
                            placeholder="Replace..."
                            className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Value</label>
                        <input
                          type="text"
                          value={bulkEditParams.vendor.value}
                          onChange={(e) => setBulkEditParams(p => ({
                            ...p,
                            vendor: { ...p.vendor, value: e.target.value }
                          }))}
                          placeholder="New vendor name..."
                          required
                          className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Status */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.status.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.status.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        status: { ...p.status, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Pinterest Bot Status
                  </label>
                </div>
                {bulkEditParams.status.enabled && (
                  <div className="pl-6 max-w-xs mt-2">
                    <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">New Status</label>
                    <select
                      value={bulkEditParams.status.value}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        status: { ...p.status, value: e.target.value }
                      }))}
                      className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 5. Body (HTML) */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.bodyHtml.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.bodyHtml.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        bodyHtml: { ...p.bodyHtml, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Description / Body (HTML)
                  </label>
                </div>
                {bulkEditParams.bodyHtml.enabled && (
                  <div className="space-y-3 pl-6 mt-2">
                    <div className="max-w-xs">
                      <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Action</label>
                      <select
                        value={bulkEditParams.bodyHtml.type}
                        onChange={(e) => setBulkEditParams(p => ({
                          ...p,
                          bodyHtml: { ...p.bodyHtml, type: e.target.value }
                        }))}
                        className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] cursor-pointer"
                      >
                        <option value="set_value">Set to specific description</option>
                        <option value="replace_text">Find & Replace text</option>
                        <option value="prepend">Prepend text</option>
                        <option value="append">Append text</option>
                      </select>
                    </div>
                    {bulkEditParams.bodyHtml.type === 'replace_text' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Find</label>
                          <textarea
                            value={bulkEditParams.bodyHtml.find}
                            onChange={(e) => setBulkEditParams(p => ({
                              ...p,
                              bodyHtml: { ...p.bodyHtml, find: e.target.value }
                            }))}
                            placeholder="Find description text..."
                            required
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] font-mono"
                          />
                          {bodyMatchLoading ? (
                            <p className="text-[10px] text-[#888] mt-1 animate-pulse">Checking database...</p>
                          ) : bodyMatchCount !== null ? (
                            <p className="text-[10px] text-[#b8972e] mt-1 font-medium">
                              🔍 Found {bodyMatchCount.toLocaleString()} matching products in database
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Replace</label>
                          <textarea
                            value={bulkEditParams.bodyHtml.replace}
                            onChange={(e) => setBulkEditParams(p => ({
                              ...p,
                              bodyHtml: { ...p.bodyHtml, replace: e.target.value }
                            }))}
                            placeholder="Replace with..."
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">Description Value</label>
                        <textarea
                          value={bulkEditParams.bodyHtml.value}
                          onChange={(e) => setBulkEditParams(p => ({
                            ...p,
                            bodyHtml: { ...p.bodyHtml, value: e.target.value }
                          }))}
                          placeholder="HTML or plain text..."
                          required
                          rows={3}
                          className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Stock Count */}
              <div className={`p-4 rounded border transition-colors ${bulkEditParams.stockCount.enabled ? 'bg-[#181510] border-[#b8972e]/30' : 'bg-transparent border-[#222]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkEditParams.stockCount.enabled}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        stockCount: { ...p.stockCount, enabled: e.target.checked }
                      }))}
                      className="accent-[#b8972e]"
                    />
                    Modify Stock Count
                  </label>
                </div>
                {bulkEditParams.stockCount.enabled && (
                  <div className="pl-6 max-w-xs mt-2">
                    <label className="block text-[#888] text-[10px] uppercase tracking-wider mb-1">New Stock Count</label>
                    <input
                      type="number"
                      value={bulkEditParams.stockCount.value}
                      onChange={(e) => setBulkEditParams(p => ({
                        ...p,
                        stockCount: { ...p.stockCount, value: e.target.value }
                      }))}
                      required
                      className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                    />
                  </div>
                )}
              </div>
            </form>
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#222] flex justify-end gap-3 bg-[#0d0d0d]">
              <button
                type="button"
                onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 border border-[#333] hover:border-white text-white rounded text-xs transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEditSubmit}
                disabled={isBulkEditing || !Object.values(bulkEditParams).some(f => f.enabled)}
                className="bg-[#b8972e] hover:bg-[#a68524] disabled:bg-[#333] disabled:text-[#666] text-black font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer select-none"
              >
                {isBulkEditing ? "Applying Changes..." : "Apply Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-[#111] border border-[#222] rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col animate-toast-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
              <div>
                <h3 className="text-white text-base font-medium tracking-wide">Import Products (CSV)</h3>
                <p className="text-[#666] text-xs mt-0.5">Upload a Shopify-format or custom CSV file to import products in bulk</p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportProductsData([]);
                  setImportFilterKeyword("");
                }}
                className="text-[#666] hover:text-white transition-colors cursor-pointer"
                disabled={importLoading}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Drag and Drop Zone */}
              {importProductsData.length === 0 ? (
                <div
                  onDragEnter={handleImportDrag}
                  onDragOver={handleImportDrag}
                  onDragLeave={handleImportDrag}
                  onDrop={handleImportDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    importDragActive ? "border-[#b8972e] bg-[#b8972e]/5" : "border-[#333] hover:border-[#444] bg-[#161616]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFileChange}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-[#b8972e] mx-auto mb-3" />
                    <p className="text-white text-sm font-light">Drag & drop your products CSV file here, or <span className="text-[#b8972e] font-semibold hover:underline">browse</span></p>
                    <p className="text-[#555] text-xs mt-1.5">File must contain at least 'Handle' and 'Title' columns</p>
                  </label>
                </div>
              ) : (
                <div className="bg-[#161616] border border-[#222] rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#222] pb-3">
                    <div>
                      <span className="text-white text-sm font-semibold">File parsed successfully!</span>
                      {importFilterKeyword.trim() ? (
                        <p className="text-[#b8972e] text-xs font-semibold mt-0.5">
                          {getFilteredImportProducts().length.toLocaleString()} of {importProductsData.length.toLocaleString()} products match filter
                        </p>
                      ) : (
                        <p className="text-[#b8972e] text-xs font-semibold mt-0.5">{importProductsData.length.toLocaleString()} products found</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setImportProductsData([]);
                        setImportFilterKeyword("");
                      }}
                      className="text-[#666] hover:text-white text-xs underline cursor-pointer"
                      disabled={importLoading}
                    >
                      Clear File
                    </button>
                  </div>

                  {/* Filter Keyword Input */}
                  <div className="pb-3 border-b border-[#222]">
                    <label className="block text-white text-xs font-semibold mb-1.5 uppercase tracking-wider">Filter by Brand/Keyword (Optional):</label>
                    <input
                      type="text"
                      placeholder="e.g. Hermes, Chanel, Title keyword..."
                      value={importFilterKeyword}
                      onChange={(e) => setImportFilterKeyword(e.target.value)}
                      disabled={importLoading}
                      className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e] placeholder-[#444]"
                    />
                    <span className="text-[10px] text-[#555] mt-1 block">Only products containing this keyword in Title, Vendor/Brand, or any field will be imported.</span>
                  </div>

                  {/* Summary Preview */}
                  <div className="space-y-2">
                    <span className="block text-[#666] text-[10px] uppercase font-bold tracking-wider">
                      {importFilterKeyword.trim() ? "Preview (First 3 matching products)" : "Preview (First 3 products)"}
                    </span>
                    <div className="border border-[#222] rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[#0f0f0f] border-b border-[#222] text-[#888]">
                            <th className="px-3 py-2">Title</th>
                            <th className="px-3 py-2">Handle</th>
                            <th className="px-3 py-2">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredImportProducts().length === 0 ? (
                            <tr>
                              <td colSpan="3" className="px-3 py-4 text-center text-[#555] italic">No products match your filter</td>
                            </tr>
                          ) : (
                            getFilteredImportProducts().slice(0, 3).map((item, idx) => (
                              <tr key={idx} className="border-b border-[#1f1f1f] text-gray-300">
                                <td className="px-3 py-2 truncate max-w-[120px]">{item.Title || item.title || '—'}</td>
                                <td className="px-3 py-2 truncate max-w-[120px]">{item.Handle || item.handle || '—'}</td>
                                <td className="px-3 py-2">${Number(item['Variant Price'] || item.price || 0).toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Option Update */}
                  <label className="flex items-center gap-2 text-white font-medium text-xs cursor-pointer select-none pt-2">
                    <input
                      type="checkbox"
                      checked={importUpdateExisting}
                      onChange={(e) => setImportUpdateExisting(e.target.checked)}
                      className="accent-[#b8972e]"
                      disabled={importLoading}
                    />
                    Update existing products if handles already exist in database
                  </label>
                </div>
              )}

              {/* Progress Bar */}
              {importLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Importing products...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#b8972e] h-full rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#222] flex justify-end gap-3 bg-[#0d0d0d]">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportProductsData([]);
                  setImportFilterKeyword("");
                }}
                className="px-4 py-2 border border-[#333] hover:border-white text-white rounded text-xs transition-colors cursor-pointer select-none"
                disabled={importLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={importLoading || getFilteredImportProducts().length === 0}
                className="bg-[#b8972e] hover:bg-[#a68524] disabled:bg-[#333] disabled:text-[#666] text-black font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer select-none"
              >
                {importLoading ? "Uploading..." : `Import ${getFilteredImportProducts().length.toLocaleString()} Product${getFilteredImportProducts().length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Pinterest CSV Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-[#111] border border-[#222] rounded-lg max-w-md w-full flex flex-col animate-toast-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
              <div>
                <h3 className="text-white text-base font-medium tracking-wide">Export Pinterest CSV</h3>
                <p className="text-[#666] text-xs mt-0.5">Generate a CSV file matching the exact Pinterest catalogs bulk upload format</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#666] hover:text-white transition-colors cursor-pointer"
                disabled={isExporting}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleExportSubmit} className="p-6 space-y-4">
              {/* Target Selector */}
              <div>
                <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wider">1. Products to Export:</label>
                <div className="space-y-2 bg-[#161616] border border-[#222] p-3 rounded">
                  <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="exportTarget"
                      value="all"
                      checked={exportTarget === 'all'}
                      onChange={(e) => setExportTarget(e.target.value)}
                      className="accent-[#b8972e]"
                    />
                    <span>All Products in Database ({totalProducts.toLocaleString()})</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="exportTarget"
                      value="filtered"
                      checked={exportTarget === 'filtered'}
                      onChange={(e) => setExportTarget(e.target.value)}
                      className="accent-[#b8972e]"
                    />
                    <span>Filtered/Search Results ({totalProducts.toLocaleString()} total query)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ccc] hover:text-white text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="exportTarget"
                      value="selected"
                      checked={exportTarget === 'selected'}
                      onChange={(e) => setExportTarget(e.target.value)}
                      disabled={selectedHandles.size === 0}
                      className="accent-[#b8972e] disabled:opacity-30"
                    />
                    <span className={selectedHandles.size === 0 ? "opacity-40" : ""}>
                      Selected Rows Only ({selectedHandles.size} selected)
                    </span>
                  </label>
                </div>
              </div>

              {/* Migration Status & Filter Checkbox */}
              <div className="bg-[#161616] border border-[#222] p-3.5 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">Migration to Spaces:</span>
                  {loadingMigratedCount ? (
                    <span className="text-[10px] text-[#b8972e] animate-pulse">Loading progress...</span>
                  ) : (
                    <span className="text-[10px] text-[#b8972e] font-bold">
                      {migratedCount.toLocaleString()} / {totalProducts.toLocaleString()} ready
                    </span>
                  )}
                </div>
                <p className="text-[#666] text-[10px] leading-snug">
                  Pinterest crawler requires direct CDN images. Non-migrated products (Google Drive links) will fail to post pins.
                </p>
                <label className="flex items-start gap-2.5 text-[#ccc] hover:text-white text-xs cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={exportMigratedOnly}
                    onChange={(e) => setExportMigratedOnly(e.target.checked)}
                    className="accent-[#b8972e] mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-white">Only export migrated products (Recommended)</span>
                    <p className="text-[#555] text-[10px] mt-0.5">Filter the file to download only the {migratedCount.toLocaleString()} products with direct `.jpg` links.</p>
                  </div>
                </label>
              </div>

              {/* Storefront Domain */}
              <div>
                <label className="block text-white text-xs font-semibold mb-1 uppercase tracking-wider">2. Storefront Domain Link:</label>
                <input
                  type="url"
                  required
                  value={exportDomain}
                  onChange={(e) => setExportDomain(e.target.value)}
                  placeholder="https://chainandstrap.store"
                  className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                />
                <span className="text-[10px] text-[#555] mt-1 block">Used to generate dynamic destination links: <code>domain/product/handle</code></span>
              </div>

              {/* Board Name */}
              <div>
                <label className="block text-white text-xs font-semibold mb-1 uppercase tracking-wider">3. Pinterest Board Name:</label>
                <input
                  type="text"
                  required
                  value={exportBoard}
                  onChange={(e) => setExportBoard(e.target.value)}
                  placeholder="e.g. Chain & Straps"
                  className="w-full bg-[#1c1c1c] border border-[#333] text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-[#b8972e]"
                />
                <span className="text-[10px] text-[#555] mt-1 block">Pins will be imported directly to this board. Falls back to product Brand if empty.</span>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#222] flex justify-end gap-3 bg-[#111]">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-[#333] hover:border-white text-white rounded text-xs transition-colors cursor-pointer select-none"
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  className="bg-[#b8972e] hover:bg-[#a68524] disabled:bg-[#333] disabled:text-[#666] text-black font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer select-none flex items-center justify-center"
                >
                  {isExporting ? "Exporting..." : "Download Pinterest CSV"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-toast-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-[#0d0d0d]/95 backdrop-blur-md min-w-[320px] max-w-md ${
            toast.type === 'success' 
              ? 'border-[#b8972e]/30' 
              : 'border-red-500/30'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[#b8972e] flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${
                toast.type === 'success' ? 'text-[#b8972e]' : 'text-red-500'
              }`}>
                {toast.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-xs text-gray-300 font-medium mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-[#444] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Embedded style tag for smooth slide-in notification micro-animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastSlideIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-toast-in {
          animation: toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

    </div>
  );
}
