import {createCustomElement , actionTypes} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import {createGraphQLEffect} from '@servicenow/ui-effect-graphql';

import '@servicenow/now-button';
import '@servicenow/now-input';
import '@servicenow/now-tabs';
import '@servicenow/now-alert';
const INCIDNET_GQL_QUERY = `
	query($number : String!){
	x532635MyorgI1 {
	  	incident{
			incident(number: $number) {
		  	sys_id 
		  	number
		  	short_description 
		}
		
	  }
	}
  }
`
const view = (state, {updateState}) => {
	const {tabItem, selectedTab} = state;
	if(selectedTab.id == 'create'){
		return (
			<div>
				<now-tabs 
					items={tabItem} selectedItem={selectedTab.id} maxWidth={240}>
				</now-tabs>
				<div>
					<now-input helperContent="Unique identifier for an incident"  label="Short Description" messages={[{"status":"critical","icon":"circle-exclamation-outline","content":"This field is required"}]} 
						placeholder="Enter Short Description" required={true} step="any" type="text" value="">
					</now-input>
				</div>
				<div>
					<now-button label="Create Incident" variant="primary-positive" size="md" icon="documents-outline" 
					tooltipContent="Create Incident" ></now-button>
				</div><br></br>
				{state.create_incident_result.value ?
				<div>
					<now-alert status="info" icon="exclamation-triangle-outline" header="" 
						content={{"type":"html","value":"There is a incident created"}} 
						textLinkProps= {state.create_incident_result}
						action={{"type":"dismiss"}}>
					</now-alert> 
				</div> : null
				}
				</div>
		);
	}
	else if(selectedTab.id == 'get'){
		return (
			<div>
				<now-tabs 
					items={tabItem} selectedItem={selectedTab.id} maxWidth={240}>
				</now-tabs>
				<div>
					<now-input helperContent="Unique identifier for an incident"  label="Number" messages={[{"status":"critical","icon":"circle-exclamation-outline","content":"This field is required"}]} 
						placeholder="Enter incident number" required={true} step="any" type="text" value="">
					</now-input>
				</div>
				<div>
					<now-button label="Get Incident" variant="primary-positive" size="md" icon="documents-outline" 
					tooltipContent="Get Incident" ></now-button>
					
				</div><br></br>
				{state.get_incident_result.value ? 
					<div>
						<now-alert status="info" icon="exclamation-triangle-outline" header="" 
							content={{"type":"html","value":state.get_incident_result.message}} 
							textLinkProps= {state.get_incident_result.url}
							action={{"type":"dismiss"}}>
						</now-alert> 
					</div>:null
				}		
			</div>
		);
	}
	else if(selectedTab.id == 'cancel'){
		return (
			<div>
				<now-tabs 
					items={tabItem} selectedItem={selectedTab.id} maxWidth={240}>
				</now-tabs>
				<div>
					<now-input helperContent="Unique identifier for an incident" label="Number" messages={[{"status":"critical","icon":"circle-exclamation-outline","content":"This field is required"}]} 
						placeholder="Enter incident number" required={true} step="any" type="text" value="">
					</now-input>
				</div>
				<div>
					<now-button label="Cancel Incident" variant="primary-negative" size="md" icon="documents-outline" 
					tooltipContent="Cancel Incident"></now-button>
				</div><br></br>
				{state.cancel_incident_result.value ? 
					<div>
						<now-alert status="info" icon="exclamation-triangle-outline" header="" 
							content={{"type":"html","value":'Incident Cancelled Sucessfully'}} 
							textLinkProps= {state.cancel_incident_result}
							action={{"type":"dismiss"}}>
						</now-alert> 
					</div>:null
				}
			</div>
		);
	}
};

createCustomElement('x-532635-incident-component-paris', {
	renderer: {type: snabbdom},
	view,
	styles,
	initialState : {
		tabItem : [{"id":"create","label":"Create Incident"},
					{"id":"get","label":"Get Incident"},
					{"id":"cancel","label":"Cancel Incident"}],
		selectedTab : {
			'id' : 'create'
		},
		short_description : '',
		number : '',
		create_incident_result :{value:false,"label":"","href":"http://www.servicenow.com"},
		get_incident_result : {value:false,
								url : {"label":"test","href":"http://www.servicenow.com"},
								message : ''
		},
		cancel_incident_result : {value:false,"label":"","href":"http://www.servicenow.com"}
	},
	actionHandlers : {
		'NOW_TABS#SELECTED_ITEM_SET' : (coeffects) => {
			const {action,updateState} = coeffects;
			updateState({selectedTab : {'id' : action.payload.value}})
			
		},
		'NOW_INPUT#VALUE_SET' : (coeffects) => {
			const {action,updateState,state} = coeffects;
			if(state.selectedTab.id == 'create')updateState({'short_description' : action.payload.value});
			else if (state.selectedTab.id == 'get')updateState({'number' : action.payload.value});
			else if (state.selectedTab.id == 'cancel')updateState({'number' : action.payload.value});
			
		},
		'NOW_BUTTON#CLICKED' :(coeffects)=>{
			
			const {dispatch,state} = coeffects;
			if(state.short_description!='' && state.selectedTab.id=='create'){
				dispatch('CREATE_INCIDENT',{
					data :{"short_description":state.short_description}
				})
			}else if (state.number!='' && state.selectedTab.id=='get'){
				dispatch('GET_INCIDENT',{
					number :state.number
				})
			}else if (state.number!='' && state.selectedTab.id=='cancel'){
				dispatch('GET_INCIDENT',{
					number :state.number
				})
			}
			
			
		},
		'CANCEL_INCIDENT' : createHttpEffect('api/now/table/incident/:id',{
			method : 'PUT',
			pathParams: ['id'],
			dataParam:'data',
			successActionType :'CANCEL_TASK_DATA_SUCCEEDED',
			errorActionType : 'CANCEL_TASK_DATA_Failed'
		}),
		
		'CREATE_INCIDENT' : createHttpEffect('api/now/table/incident',{
			method : 'POST',
			dataParam:'data',
			successActionType :'FETCH_TASK_DATA_SUCCEEDED',
		}),
		'FETCH_TASK_DATA_SUCCEEDED' : ({action,updateState}) =>{
			const result = action.payload.result;
			const link = 'https://dev64146.service-now.com/nav_to.do?uri=incident.do?sys_id='+result.sys_id;
			updateState({'create_incident_result':{value:true,"label":result.number,"href":link}})
			
		},
		'GET_INCIDENT' : createGraphQLEffect(INCIDNET_GQL_QUERY,{
			variableList: ['number'],
			successActionType: 'DATA_FETCH_SUCCEEDED',
			errorActionType : 'DATA_FETCH_FAILED'
		}),
		'DATA_FETCH_SUCCEEDED' : ({action,updateState,state,dispatch}) =>{
			const get_result = action.payload.data.x532635MyorgI1.incident.incident;
			if(action.payload.errors.length==0  && state.selectedTab.id=='get'){
				const link = 'https://dev64146.service-now.com/nav_to.do?uri=incident.do?sys_id='+get_result.sys_id;
				updateState({'get_incident_result' : 
							{value:true,
							url : {"label":get_result.number,"href":link},
							message : 'The Short Description of incident is ' + get_result.short_description 
				}})
			}else if (action.payload.errors.length==0  && state.selectedTab.id=='cancel'){
				console.log(get_result.sys_id)
				dispatch('CANCEL_INCIDENT',{
					id : get_result.sys_id ,
					data :{"state":"8"}
				})
			}
			
		},
		'DATA_FETCH_FAILED' : ({action,updateState}) => {
			
			console.log('Fail');
		},
		'CANCEL_TASK_DATA_SUCCEEDED' : ({action,updateState}) =>{
			const result = action.payload.result;
			const link = 'https://dev64146.service-now.com/nav_to.do?uri=incident.do?sys_id='+result.sys_id;
			updateState({'cancel_incident_result':{value:true,"label":result.number,"href":link}})
		},
		'CANCEL_TASK_DATA_Failed' : ({action,updateState}) =>{
			
			console.log('Fail')
		}

	}
});
