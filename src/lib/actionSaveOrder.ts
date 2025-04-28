import { createOrder, deleteDraftById, deleteDraftProduct, getDraftById, getDraftsProducts, getOrderNumber, updateOrderProductsList } from "./orders/getOrderData"

export default async function actionSaveOrder(sodata: any) {

    const draftvalues = await getDraftById(sodata.draftId)

    const gon = await getOrderNumber()
    const on = gon + 1

    const codata = {
        order_number: on,
        user_id: sodata.userId,
        company_id: draftvalues?.company_id,
        delivery_address: draftvalues?.delivery_address,
        project_id: draftvalues?.project_id,
        cost_center_id: draftvalues?.cost_center_id,
        approver_id: draftvalues?.approver_id,
        delivery_at: draftvalues?.delivery_at,
        purchaser: null,
        requester: sodata.requester
    }

    const co = await createOrder(codata)
    console.log('sera que ta vindo', co)
    const draftproducts = await getDraftsProducts(sodata.draftId)
    
    const dp = async () => {
        draftproducts.map(async (item) => {
            const prods = {
                order_id: co.order_id,
                product_id: item.product_id,
                measure_id: item.measure_id,
                quantity: item.quantity,
                reference: item.reference,
                obs: item.obs
            }
            const up = await updateOrderProductsList(prods)
        })
    }

    const upopl = await dp()

    const gdp = await getDraftsProducts(sodata.draftId)
    const delprods = gdp.map(async (res) => {
        await deleteDraftProduct(res.draft_product_list_id)
    })

     const res = await deleteDraftById(sodata.draftId)
}