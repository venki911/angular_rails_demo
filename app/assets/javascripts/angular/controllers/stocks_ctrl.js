app.controller('StockCtrl', ['$scope', 'Stock', '$filter', '$http', '$q', function($scope, Stock, $filter, $http, $q) {
  $scope.stocks = Stock.all();
  $scope.error = false;
  $scope.select2Options = {};
  $scope.stocklist = [{symbol: "AAPL", name: "Apple Inc"},
                      {symbol: "MSFT", name: "Microsoft Inc"},
                      {symbol: "GOOG", name: "Google"}];
  $scope.$watch('newCompany', function(){
    if ($scope.newCompany != "" & $scope.newCompany != null) {
      $scope.createStock();
    }
  });

  $scope.requestOHLC = function(stockid) {
    return Stock.ohlc(stockid);
  };

  $scope.createStock = function() {
    $scope
      .fetchYahooFinanceData($filter('uppercase')($scope.newCompany))
      .then(
        function(result) {
          $scope.error = false;
          $scope.stocks.push(Stock.create(result));
          $scope.newCompany = '';
        },
        function(error) {
          $scope.error = true;
        }
      );
  };

  $scope.updateStock = function(id, idx) {
    var stock = $scope.stocks[idx];
    $scope.fetchYahooFinanceData(stock.symbol).then(
      function(result) {
        $scope.error = false;
        result.id = stock.id
        $scope.stocks[idx] = Stock.update(result);
      },
      function(error) {
        $scope.error = true;
      });
  };

  $scope.fetchYahooFinanceData = function(symbol) {
    var deferred = $q.defer();
    var stock = {};
    $scope.loading = true;
    $http({method: 'GET', url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20WHERE%20symbol%3D" + "'" + symbol + "'" + "&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"}
    ).success(function(data, status, headers, config) {
      stock.symbol = symbol;
      stock.name = data.query.results.quote["Name"];
      stock.bid = data.query.results.quote["Bid"];
      stock.ask = data.query.results.quote["Ask"];
      stock.year_low = data.query.results.quote["YearLow"];
      stock.year_high = data.query.results.quote["YearHigh"];
      $scope.loading = false;
      deferred.resolve(stock);
    }).error(function(data, status, headers, config) {
      $scope.loading = false;
      deferred.reject(status);
    });

    return deferred.promise;
  };

  $scope.deleteStock = function(id, idx) {
    $scope.stocks.splice(idx, 1);
    return Stock.delete(id);
  };
}]);