import { LightningElement, wire,api} from 'lwc';
import  getParentAccounts from '@salesforce/apex/AccountHelper.getParentAccounts'
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_PARENT from '@salesforce/schema/Account.ParentId';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_SLA_EXPIRY_DT from '@salesforce/schema/Account.SLAExpirationDate__c';
import ACCOUNT_NO_OF_LOCATION from '@salesforce/schema/Account.NumberofLocations__c';
import ACCOUNT_SLA_TYPE from '@salesforce/schema/Account.SLA__c';
import ACCOUNT_DESCRIPTION from '@salesforce/schema/Account.Description';
import { createRecord, deleteRecord, getFieldValue, getRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import ACCOUNT_ID from '@salesforce/schema/Account.Id'; // this is imortant for update Operation 

import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const fieldsToLoad = [ACCOUNT_PARENT,ACCOUNT_NAME,ACCOUNT_SLA_EXPIRY_DT,ACCOUNT_SLA_TYPE,ACCOUNT_NO_OF_LOCATION,ACCOUNT_DESCRIPTION]

export default class AccountDetails extends NavigationMixin(LightningElement) {
   parentoptions = [];
   selectedParentAcc = '';
   selnoofLocation='1';
   selAccName='';
   selExpDate = null
   selSlaType ='';
   selDesciption='';
  
   @api recordId;


   @wire(getRecord,{
      recordId : "$recordId",
      fields : fieldsToLoad
   }) wiredgetRecord_Fucntion({data,error}){
    //getFieldValue  this is inbuilt method

    if(data){
    this.selParentAcc = getFieldValue(data ,ACCOUNT_PARENT);
    this.selnoofLocation = getFieldValue(data,ACCOUNT_NO_OF_LOCATION);
    this.selAccName = getFieldValue(data,ACCOUNT_NAME);

    this.selExpDate = getFieldValue(data,ACCOUNT_SLA_EXPIRY_DT);

    this.selDesciption = getFieldValue(data,ACCOUNT_DESCRIPTION);

    this.selSlaType = getFieldValue(data,ACCOUNT_SLA_TYPE )
    }
    else if(error){
        console.error('Error Message retivel',error)
    }
   }

    @wire(getParentAccounts) wired_getParentAccount({data,error}){
        this.parentoptions = [];       
        if(data){
            this.parentoptions=  data.map((curritem)=>({
            label : curritem.Name,
            value : curritem.Id
         }));
        }
        else if (error){
            console.log('error pr Recrods',error)
        }
    }


   @wire(getObjectInfo,{
      objectApiName: ACCOUNT_OBJECT 
   })  accountobjectinfo;



 @wire(getPicklistValues,{
    recordTypeId :"$accountobjectinfo.data.defaultRecordTypeId",
    fieldApiName: ACCOUNT_SLA_TYPE 
 })
 slapicklist;
 
        handleChange(e){
             let{name,value} = e.target;
             if(name === 'parentacc'){
              this.selectedParentAcc = value
             }
             if(name === 'accname'){
                this.selAccName = value
                      }
                      if( name === "slaexpdt"){
                        this.selExpDate = value
                        }
                        if( name === "slatype"){
                            this.selSlaType = value
                            }
                            if( name === "nooflocations"){
                                this.selnoofLocation = value
                                }
                                if( name === "description"){
                                    this.selDesciption = value
                                    }                        
        }

        saveRecord(){
            console.log('Acccount_OBJECT' ,ACCOUNT_OBJECT);
            console.log('ACCOUNT_NAME', ACCOUNT_NAME); 
            if(this.validateInput()){
                  let inputfields = {}
                  inputfields[ACCOUNT_NAME.fieldApiName]  = this.selAccName;
                  inputfields[ACCOUNT_PARENT.fieldApiName] = this.selectedParentAcc
                  inputfields[ACCOUNT_SLA_TYPE.fieldApiName]  = this.selSlaType;
                  inputfields[ACCOUNT_SLA_EXPIRY_DT.fieldApiName]  = this.selExpDate;
                  inputfields[ACCOUNT_NO_OF_LOCATION.fieldApiName] =this.selnoofLocation;  
                  inputfields[ACCOUNT_DESCRIPTION.fieldApiName] = this.selDesciption;
                  
                  if(this.recordId){
                    inputfields[ACCOUNT_ID.fieldApiName] = this.recordId;

                    let recordInput = {
                        fields: inputfields
                    }
                    updateRecord(recordInput).then((result)=>{
                        console.log('Data is coming for Update things ' + result.data);
                        this.showToast();
                    })
                    .catch((error)=>{
                        console.log('Record Udpate fail' + error)
                    })
                  }else{

                    createRecord(recordInput)
                    .then((result) => {
                       console.log('Successfully ' ,result)
                       // For Navigation
                       let pageref ={
                           
                               type: 'standard__recordPage',
                               attributes: {
                                   recordId: result.id,
                                   objectApiName: ACCOUNT_OBJECT.objectApiName,
                                   actionName: 'view'
                               
                       }
                       }
                       this[NavigationMixin.Navigate](pageref);
                   }) 
                   .catch((error)=>{
                       console.log('Input are not Valid',error)
                   }) 

                  }
                    let recordInput = {
                    apiName:ACCOUNT_OBJECT.objectApiName,
                    fields: inputfields,
                }


            //  createRecord(recordInput)
            //  .then((result) => {
            //     console.log('Successfully ' ,result)
            //     // For Navigation
            //     let pageref ={
                    
            //             type: 'standard__recordPage',
            //             attributes: {
            //                 recordId: result.id,
            //                 objectApiName: ACCOUNT_OBJECT.objectApiName,
            //                 actionName: 'view'
                        
            //     }
            //     }
            //     this[NavigationMixin.Navigate](pageref);
            // }) 
            // .catch((error)=>{
            //     console.log('Input are not Valid',error)
            // })             
            }
            else{
                console.log('Input are not Valid');
            }
        }

       validateInput(){
       let fields = Array.from( this.template.querySelectorAll('.validateme'));
      let isValid =  fields.every((item) => item.checkValidity() 
       )
       return isValid;
       }




       get formTitle(){
        if(this.recordId){
            return 'Edit Account'
        }else{
            return 'Create Account'
        }
       }

       get isDeleteAvailable(){
        if(this.recordId){
            return true;
        }else{
            return false;
        }
       }


       showToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message:'Record Udpated SuccessFully',
            variant:'success'
        });
        this.dispatchEvent(event);
    }


    deleteHandler(){
        deleteRecord(this.recordId) .then(()=>{
            console.log('Record Deleted SuccessFully');
            let pagRef = // Navigates to account list with the filter set to Recent.
            {
                type: 'standard__objectPage',
                attributes: {
                    objectApiName:ACCOUNT_OBJECT.objectApiName,
                    actionName: 'list'
                },
                state: {
                    filterName: 'Recent'
              }
            }
            this[NavigationMixin.Navigate](pagRef);
        }).catch((error)=>{
        console.log('Record Deletion Failed',error)
        })
    }


    } 
