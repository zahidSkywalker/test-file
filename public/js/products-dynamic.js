(function(){
  if (!window.Store) return;
  const grid = document.getElementById('productsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const loading = document.getElementById('loadingSkeleton');
  const noResults = document.getElementById('noResults');
  const sortSelect = document.getElementById('sortSelect');

  function setVisible(el, show){ if (!el) return; el.classList[show ? 'remove' : 'add']('hidden'); }

  function getPriceNum(val){ return parseFloat(String(val||'').replace(/[^\d.-]/g, '')) || 0; }

  function applySort(items, val){
    const arr = items.slice();
    if (val === 'price-low' || val === 'price-high') {
      arr.sort((a,b)=> getPriceNum(a.price) - getPriceNum(b.price));
      if (val === 'price-high') arr.reverse();
    } else if (val === 'name') {
      arr.sort((a,b)=> String(a.name).localeCompare(String(b.name)));
    } else if (val === 'newest') {
      arr.sort((a,b)=> (b.id||0) - (a.id||0));
    }
    return arr;
  }

  function render(items){
    if (resultsCount) resultsCount.textContent = items.length;
    if (!grid) return;
    grid.innerHTML = items.map(function(p){
      var img = (p.images && p.images[0]) || p.image || '';
      return (
        '<div class="product-card p-6" data-animate="card">' +
          (img ? '<img src="'+img+'" alt="'+(p.name||'')+'" class="w-full h-48 object-cover rounded-xl mb-4" loading="lazy"/>' : '') +
          '<h3 class="text-lg font-semibold mb-1">'+(p.name||'')+'</h3>'+
          '<div class="text-blue-600 font-bold mb-3">'+(p.price||'')+'</div>'+
          '<div class="flex gap-2">'+
            '<a href="/product-detail?id='+encodeURIComponent(p.id)+'" class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">View</a>'+
            '<button data-id="'+p.id+'" class="add-cart px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add to Cart</button>'+
            '<button data-id="'+p.id+'" class="share px-3 py-2 bg-white border rounded">Share</button>'+
          '</div>'+
        '</div>'
      );
    }).join('');
  }

  var current = [];
  setVisible(grid, false); setVisible(noResults, false); setVisible(loading, true);
  Store.fetchFeed().then(function(products){
    current = products;
    setVisible(loading, false);
    if (!products.length) { setVisible(noResults, true); return; }
    setVisible(grid, true);
    render(products);
  });

  document.addEventListener('click', function(e){
    var addBtn = e.target.closest('.add-cart');
    var shareBtn = e.target.closest('.share');
    if (addBtn) {
      var id = addBtn.getAttribute('data-id');
      var p = current.find(function(x){ return String(x.id) === String(id); });
      if (p) { Store.addToCart(p, 1); alert('Added to cart'); }
    }
    if (shareBtn) {
      var id2 = shareBtn.getAttribute('data-id');
      var p2 = current.find(function(x){ return String(x.id) === String(id2); });
      if (p2) {
        var url = Store.getShareUrl(p2);
        if (navigator.share) { navigator.share({ title: p2.name, url: url }); }
        else { navigator.clipboard.writeText(url); alert('Link copied'); }
      }
    }
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', function(e){
      render(applySort(current, e.target.value));
    });
  }
})();

