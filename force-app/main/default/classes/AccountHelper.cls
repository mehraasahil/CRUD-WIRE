public with sharing class AccountHelper {
    public AccountHelper() {

    }


    @AuraEnabled (cacheable = true)
    public static List <Account> getParentAccounts(){
        return [ Select Id ,Name ,Industry From Account Where AnnualRevenue != null WITH USER_MODE];
    }
}