angular.module("expensesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    expenses: function(Expenses) {
                        return Expenses.getExpenses();
                    }
                }
            })
            .when("/new/expense", {
                controller: "NewExpenseController",
                templateUrl: "expense-form.html"
            })
            .when("/expense/:expenseId", {
                controller: "EditExpenseController",
                templateUrl: "expense.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Expenses", function($http) {
        this.getExpenses = function() {
            return $http.get("/expenses").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding expenses.");
                });
        }
        this.createExpense = function(expense) {
            return $http.post("/expenses", expense).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating expense.");
                });
        }
        this.getExpense = function(expenseId) {
            var url = "/expenses/" + expenseId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this expense.");
                });
        }
        this.editExpense = function(expense) {
            var url = "/expenses/" + expense._id;
            console.log(expense._id);
            return $http.put(url, expense).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this expense.");
                    console.log(response);
                });
        }
        this.deleteExpense = function(expenseId) {
            var url = "/expenses/" + expenseId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this expense.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(expenses, $scope) {
        $scope.expenses = expenses.data;
        var len = expenses.data.length;
        console.log(expenses.data)
        for(var i=0;i<len;i++){
            $scope.total+=parseFloat(expenses.data[i].amount);
        }
    })
    .controller("NewExpenseController", function($scope, $location, Expenses) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveExpense = function(expense) {
            Expenses.createExpense(expense).then(function(doc) {
                var expenseUrl = "/expense/" + doc.data._id;
                $location.path(expenseUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditExpenseController", function($scope, $routeParams, Expenses) {
        Expenses.getExpense($routeParams.expenseId).then(function(doc) {
            $scope.expense = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.expenseFormUrl = "expense-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.expenseFormUrl = "";
        }

        $scope.saveExpense = function(expense) {
            expense.updateDate=new Date();
            Expenses.editExpense(expense);
            $scope.editMode = false;
            $scope.expenseFormUrl = "";
        }

        $scope.deleteExpense = function(expenseId) {
            Expenses.deleteExpense(expenseId);
        }
    });