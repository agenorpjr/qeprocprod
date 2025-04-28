import { addDraftNumber, addDraftProduct, getDraftId, getDraftNumber, getDraftsProducts, updateDraft } from "./orders/getOrderData";

export default async function actionCopyOrder(data: any) {
    const latestQuery = await getDraftNumber()
    const ln = parseInt(latestQuery.replace(/([^\d])+/gim, ''));
    const latestQuerynumber = `${latestQuery.replace(/[0-9]/g, '')}${(ln + 1)}`
    const adn = await addDraftNumber(latestQuerynumber, data.user_id)
    const dId = await getDraftId(latestQuerynumber)
    const values = {
        company_id: data.company_id,
        delivery_address: data.delivery_address,
        cost_center_id: data.cost_center_id,
        delivery_at: data.delivery_at,
        project_id: data.project_id,
        approver_id: data.approver_id
    }
    
    const updateValues = await updateDraft(values, latestQuerynumber)
    
    const final = async () => {
        data.order_products_list.map(async (item) => {
            const prods = {
                draft_id: dId,
                product_id: item.product_id,
                measure_id: item.measure_id,
                quantity: item.quantity,
                reference: item.reference,
                obs: item.obs
            }
            const adp = await addDraftProduct(prods)
        })
    }

    const endfinal = await final()
    const gdp = await getDraftsProducts(dId)
}