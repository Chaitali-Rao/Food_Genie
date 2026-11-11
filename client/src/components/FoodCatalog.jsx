import React, { useState, useEffect, useCallback } from 'react';
import foodService from '../services/foodService';
import { useCart } from '../contexts/CartContext';
import FoodDetailModal from './FoodDetailModal';

export const FoodCatalog = () => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  // Data states
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietary, setDietary] = useState('all'); // 'all', 'veg', 'non-veg'
  const [spicyLevel, setSpicyLevel] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState(null);

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await foodService.getCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch foods with active filters
  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      if (dietary === 'veg') params.isVeg = true;
      if (dietary === 'non-veg') params.isVeg = false;

      if (spicyLevel !== '') params.spicyLevel = spicyLevel;
      if (sort !== 'featured') params.sort = sort;

      const res = await foodService.getFoods(params);
      if (res.success) {
        setFoods(res.foods);
        setTotalCount(res.totalCount);
      }
    } catch (err) {
      console.error('Failed to load foods', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, dietary, spicyLevel, sort, page]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setDietary('all');
    setSpicyLevel('');
    setSort('featured');
    setPage(1);
  };

  const getDietaryBadge = (isVeg) => {
    return (
      <span
        className={`veg-indicator-box ${isVeg ? 'veg' : 'non-veg'}`}
        title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
      >
        <span className="veg-circle"></span>
      </span>
    );
  };

  return (
    <section className="catalog-section" id="food-menu">
      <div className="catalog-header-area">
        <div className="catalog-titles">
          <span className="badge-tag">✨ Chef's Handcrafted Selection</span>
          <h2 className="catalog-main-title">Explore Delicious Dishes</h2>
          <p className="catalog-subtitle">
            Summon handcrafted gourmet pizzas, authentic South Indian delicacies, sizzling smash burgers, royal biryanis, and healthy greens.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search dosa, idli, pizza, biryani, burgers, spicy..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="categories-scroll-bar">
        <button
          className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('all');
            setPage(1);
          }}
        >
          <span className="cat-icon">🍽️</span>
          <span className="cat-name">All Cuisines</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`cat-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
          >
            <span className="cat-icon">{cat.icon || '🍲'}</span>
            <span className="cat-name">{cat.name}</span>
            {cat.itemCount > 0 && (
              <span className="cat-count">{cat.itemCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="filter-toolbar">
        <div className="dietary-filter-group">
          <button
            className={`filter-btn ${dietary === 'all' ? 'active' : ''}`}
            onClick={() => {
              setDietary('all');
              setPage(1);
            }}
          >
            All
          </button>
          <button
            className={`filter-btn ${dietary === 'veg' ? 'active veg-active' : ''}`}
            onClick={() => {
              setDietary('veg');
              setPage(1);
            }}
          >
            🟢 Veg Only
          </button>
          <button
            className={`filter-btn ${dietary === 'non-veg' ? 'active nonveg-active' : ''}`}
            onClick={() => {
              setDietary('non-veg');
              setPage(1);
            }}
          >
            🔴 Non-Veg
          </button>
        </div>

        <div className="secondary-filters">
          {/* Spice Filter */}
          <select
            className="filter-select"
            value={spicyLevel}
            onChange={(e) => {
              setSpicyLevel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">🌶️ All Spice Levels</option>
            <option value="0">Mild (No Spice)</option>
            <option value="1">Medium 🌶️</option>
            <option value="2">Hot 🌶️🌶️</option>
            <option value="3">Extra Hot 🌶️🌶️🌶️</option>
          </select>

          {/* Sort Selector */}
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="featured">✨ Recommended & Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated ⭐</option>
            <option value="prep-time">Fastest Prep ⏱️</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="results-meta-bar">
        <span className="results-count">
          Showing <strong>{foods.length}</strong> of <strong>{totalCount}</strong> delicious dishes
        </span>
        {(search || selectedCategory !== 'all' || dietary !== 'all' || spicyLevel !== '') && (
          <button onClick={handleResetFilters} className="btn-reset-filters">
            ✕ Clear All Filters
          </button>
        )}
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="food-loading-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="food-skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-lines">
                <div className="skeleton-line full"></div>
                <div className="skeleton-line half"></div>
              </div>
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="empty-catalog-box">
          <span className="empty-catalog-icon">🧞‍♂️</span>
          <h3>No matching dishes found</h3>
          <p>The Genie couldn't find food matching your current filters.</p>
          <button onClick={handleResetFilters} className="btn-primary">
            Reset Filters & View All Menu
          </button>
        </div>
      ) : (
        <div className="food-grid">
          {foods.map((food) => {
            const inCartQty = getItemQuantity(food._id);

            return (
              <div key={food._id} className="food-card">
                {/* Image Container with Badges */}
                <div
                  className="food-card-img-wrap"
                  onClick={() => setSelectedFoodForDetail(food)}
                >
                  <img
                    src={food.image}
                    alt={food.name}
                    className="food-card-img"
                    loading="lazy"
                  />
                  <div className="food-card-floating-tags">
                    {getDietaryBadge(food.isVeg)}
                    {food.isFeatured && (
                      <span className="badge-featured">Chef's Pick</span>
                    )}
                  </div>
                  <div className="food-card-time-badge">
                    ⏱️ {food.prepTimeMinutes}m
                  </div>
                </div>

                {/* Content */}
                <div className="food-card-content">
                  <div className="food-card-top-row">
                    <span className="food-card-cat-name">
                      {food.category?.name || 'Cuisine'}
                    </span>
                    <span className="food-card-rating">
                      ⭐ {food.rating}
                    </span>
                  </div>

                  <h3
                    className="food-card-name"
                    onClick={() => setSelectedFoodForDetail(food)}
                  >
                    {food.name}
                  </h3>

                  <p className="food-card-desc">{food.description}</p>

                  {/* Card Bottom Row: Price & Cart Action */}
                  <div className="food-card-bottom-row">
                    <div className="food-card-price">
                      <span className="price-currency">₹</span>
                      <span className="price-number">{food.price}</span>
                    </div>

                    <div className="card-cart-action">
                      {inCartQty > 0 ? (
                        <div className="cart-counter-btn-group">
                          <button
                            type="button"
                            className="btn-counter"
                            onClick={() => updateQuantity(food._id, inCartQty - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="counter-qty">{inCartQty}</span>
                          <button
                            type="button"
                            className="btn-counter"
                            onClick={() => updateQuantity(food._id, inCartQty + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-add-food"
                          onClick={() => addToCart(food, 1)}
                        >
                          + ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal if a dish is selected */}
      {selectedFoodForDetail && (
        <FoodDetailModal
          food={selectedFoodForDetail}
          onClose={() => setSelectedFoodForDetail(null)}
        />
      )}
    </section>
  );
};

export default FoodCatalog;

