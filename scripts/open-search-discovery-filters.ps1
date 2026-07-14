# Open Search & Discovery filter configuration in Shopify Admin.
$store = "boat-o-craigo"
$url = "https://admin.shopify.com/store/$store/apps/search-and-discovery/filters"
Write-Host "Opening Search & Discovery filters..."
Write-Host $url
Start-Process $url
