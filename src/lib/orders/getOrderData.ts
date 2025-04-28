'use server'
import { revalidatePath } from "next/cache";
import db from "../db/db";

//===============================================================================
// USER
//===============================================================================

export async function getUserById(userId: string) {
    if (userId !== null) {
        const user = await db.user.findFirst({
            where: {
                id: userId
            }
        })
        
        return user
    }

    return ""
    
}

export async function getUserByName(username: string) {
    const user = await db.user.findFirst({
        where: {
            name: username
        }
    })

    return user
}


export async function getApproverByUserId(id: any) {
    const user = await db.user.findFirst({
        where: {
            id: id
        }
    })
    return user
}

export async function getApproverByName(name: any) {
    const user = await db.user.findFirst({
        where: {
            name: name
        }
    })
    return user?.id
}

export async function getPurchasers() {
    const purchasers = await db.user.findMany({
        where: {
            purchaser: 1
        }
    })
    return purchasers
}

export async function getApprovers() {
    const approvers = await db.user.findMany()
    return approvers
}


//===============================================================================
// COMPANIES
//===============================================================================
export async function getCompanies() {
    const companies = await db.companies.findMany()
    return companies
}

//===============================================================================
// DELIVERIES
//===============================================================================

export async function getDeliveries() {
    const deliveries = await db.delivery_addresses.findMany()
    return deliveries
}


//===============================================================================
// PROJECTS
//===============================================================================
export async function getProjects() {
    const projects = await db.projects.findMany()
    return projects
}


//===============================================================================
// MEASURES
//===============================================================================
export async function getMeasures() {
    const measures = await db.measures.findMany({
        orderBy: {
            measure: 'asc',
        },
    })
    return measures
}

//===============================================================================
// SUPPLIERS
//===============================================================================

export async function getSuppliers() {
    const suppliers = await db.suppliers.findMany({
        orderBy: {
            supplier: 'asc',
        },
    })
    return suppliers
}

export async function getSupplierByName(suppname: string) {
    const supplier = await db.suppliers.findFirst({
        where: {
            supplier: suppname,
        },
    })
    return supplier
}

export async function addSupplier(data: any) {
    const addsup = await db.suppliers.create({
        data: {
            supplier: data.supplier,
            cnpj: data.cnpj
        }
    })
}

//===============================================================================
// PRODUCTS
//===============================================================================

export async function getProducts() {
    const products = await db.products.findMany({
        orderBy: {
            description: 'asc'
        }
    })
    revalidatePath("/user/order")
    return products
}




export async function addProductoOnTable(data: any) {
    const adp = await db.products.create({
        data: {
            description: data.description
        }
    })
    revalidatePath("/user/order")
    return adp
}

//===============================================================================
// USERS
//===============================================================================


export async function getUsers() {
    const users = await db.user.findMany()
    return users
}

export async function updatePurchaser(data: any) {
    const user = await db.user.update({
        where: {
            id: data.id
        },
        data: {
            purchaser: data.purchaser
        }
    })
}

export async function updateApprover(data: any) {
    const user = await db.user.update({
        where: {
            id: data.id
        },
        data: {
            approver: data.approver
        }
    })
}

//===============================================================================
// DRAFTS
//===============================================================================

export async function getDrafts(user_id: string) {
    if (user_id === undefined) {
        return null
    }
    const drafts = db.drafts.findMany({
        where: {
            user_id: user_id
        },
        include: {
            companies: true,
            draft_products_list: {
                include: {
                    products: true,
                    measures: true
                }
            },
            cost_centers: true,
            projects: true
        }
    })
    return drafts
}

export async function getDraftId(dn) {
    const di = await db.drafts.findFirst({
        where: {
            draft_number: dn
        }
    })
    return di?.draft_id
}

export async function getDraftNumber() {
    const draft = await db.drafts.findMany({
        orderBy: {
            draft_id: 'desc',
        },
        take: 1,
    })
    if (draft.length > 0) {
        return draft[0].draft_number
    } else {
        return "S-0"
    }
    
}


export async function getDraftById(id) {
    const draft = await db.drafts.findFirst({
        where: {
            draft_id: id
        },
        include: {
            draft_products_list: {
                include: {
                    measures: true,
                    products: true,
                }
            },
            companies: true,
            projects: true,
            cost_centers: true,
        }
    })
    return draft
}

export async function updateDraft(savedata: any, dn: Number) {
    const draftn = await getDraftId(dn)
    const sd = await db.drafts.update({
        where: {
            draft_id: draftn
        },
        data: {
            company_id: savedata.company_id,
            delivery_address: savedata.delivery_address,
            cost_center_id: savedata.cost_center_id,
            project_id: savedata.project_id,
            delivery_at: savedata.delivery_at,
            draft_status: "enable",
            approver_id: savedata.approver_id,
            requester: savedata.requester
        }
    })

}

export async function addDraftNumber(draftnumber: string, user_id: string) {
    const dn = await db.drafts.create({
        data: {
            draft_number: draftnumber,
            user_id: user_id,
            approver_id: user_id
        }
    })
}

export async function deleteDraftById(dId) {
    const di = await db.drafts.delete({
        where: {
            draft_id: dId
        }
    })
}


//===============================================================================
// DRAFT_PRODUCTS_LIST
//===============================================================================

export async function getDraftsProducts(draft_id) {
    const dp = await db.draft_products_list.findMany({
        where: {
            draft_id: draft_id
        },
        include: {
            products: {
                include: {
                    draft_products_list: draft_id,
                },
            },
            measures: {
                include: {
                    order_products_list: draft_id
                }
            }

        }
    })
    return dp
}

export async function addDraftProduct(dataproduct: any) {
    const adp = await db.draft_products_list.create({
        data: {
            draft_id: dataproduct.draft_id,
            product_id: dataproduct.product_id,
            measure_id: dataproduct.measure_id,
            quantity: parseInt(dataproduct.quantity),
            reference: dataproduct.reference,
            obs: dataproduct.obs
        }
    })
}

export async function editDraftProduct(dataproduct: any) {
    const edp = await db.draft_products_list.update({
        where: {
            draft_product_list_id: dataproduct.draft_product_list_id
        },
        data: {
            product_id: dataproduct.product_id,
            measure_id: dataproduct.measure_id,
            quantity: dataproduct.quantity,
            reference: dataproduct.reference,
            obs: dataproduct.obs
        }
    })
}

export async function deleteDraftProduct(dataproduct: any) {
    const ddp = await db.draft_products_list.delete({
        where: {
            draft_product_list_id: dataproduct
        }
    })
}

//===============================================================================
// ORDERS
//===============================================================================

export async function getOrderNumber() {

    try {
        const order = await db.orders.findMany({
            orderBy: {
                order_id: 'desc',
            },
            take: 1,
        })
        return order[0].order_number
    } catch (err) {
        return 0
    }
}

export async function getOrderId(on: any) {
    const orderid = await db.orders.findFirst({
        where: {
            order_number: on
        }
    })

    return orderid?.order_id
}

export async function createOrder(values: any) {
    const co = await db.orders.create({
        data: {
            order_number: values.order_number,
            user_id: values.user_id,
            company_id: values.company_id,
            delivery_address: values.delivery_address,
            project_id: values.project_id,
            cost_center_id: values.cost_center_id,
            approver_id: values.approver_id,
            delivery_at: values.delivery_at
        }
    })
    return co
}

export async function getOrders(user_id: string) {
    const orders = db.orders.findMany({
        where: {
            user_id: user_id
        },
        include: {
            companies: true,
            order_products_list: {
                include: {
                    products: true,
                    measures: true,
                    suppliers: true,
                }
            },
            cost_centers: true,
            projects: true,
        }
    })
    return orders
}

export async function getOrderById(order_id: number) {
    const orders = db.orders.findFirst({
        where: {
            order_id: order_id
        },
        include: {
            companies: true,
            order_products_list: {
                include: {
                    products: true,
                    measures: true,
                    suppliers: true
                }
            },
            cost_centers: true,
            projects: true,
        }
    })
    return orders
}

export async function getAllOrders() {
    const orders = db.orders.findMany({
        include: {
            companies: true,
            order_products_list: {
                include: {
                    products: true,
                    measures: true,
                    suppliers: true,
                }
            },
            cost_centers: true,
            projects: true,
            User: true
        }
    })
    return orders
}

export async function getOrdersByApprover(approverId) {
    const orders = db.orders.findMany({
        where: {
            approver_id: approverId
        },
        include: {
            companies: true,
            order_products_list: {
                include: {
                    products: true,
                    measures: true,
                    suppliers: true,
                }
            },
            cost_centers: true,
            projects: true,
            User: true
        }
    })
    return orders
}

export async function updateOrder(savedata: any) {
    const sd = await db.orders.update({
        where: {
            order_id: savedata.order_id
        },
        data: {
            company_id: savedata.company_id,
            delivery_address: savedata.delivery_address,
            cost_center_id: savedata.cost_center_id,
            project_id: savedata.project_id,
            delivery_at: savedata.delivery_at,
            status: savedata.status,
            approver_id: savedata.approver_id
        }
    })
}

export async function updateOrderByAdmin(uporder: any) {
    const uo = await db.orders.update({
        where: {
            order_id: uporder.order_id
        },
        data: {
            status: uporder.status,
            purchaser: uporder.purchaser
        }
    })
}

export async function updateStatus(data: any) {
    const us = await db.orders.update({
        where: {
            order_id: data.order_id
        },
        data: {
            status: data.status
        }
    })
}


//===============================================================================
// ORDER_PRODUCTS_LIST
//===============================================================================

export async function updateOrderProductsList(item: any) {
    const uopl = await db.order_products_list.create({
        data: {
            order_id: item.order_id,
            product_id: item.product_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            reference: item.reference,
            obs: item.obs,
            supplier_id: null,
            purchase_number: null,
            amount: null,
            delivery_expected: null
        }
    })
}

export async function updateOrderProductListByAdmin(dataproduct: any) {
    const res = await db.order_products_list.update({
        where: {
            order_product_list_id: dataproduct.order_product_list_id
        },
        data: {
            reference: dataproduct.reference,
            obs: dataproduct.obs,
            supplier_id: dataproduct.supplier_id,
            purchase_number: dataproduct.purchase_number,
            amount: dataproduct.amount,
            delivery_expected: dataproduct.delivery_expected
        }
    })
}

//===============================================================================
// PROJECTS
//===============================================================================

export async function getProjectId(projectName: string) {
    const proj = await db.projects.findFirst({
        where: {
            project: projectName
        }
    })
    if (!proj) {
        return null
    }
    return proj?.project_id
}

export async function getProjectById(project_id: number) {
    const proj = await db.projects.findFirst({
        where: {
            project_id: project_id
        }
    })

    return proj?.project_id
}

export async function addProject(projectName: string) {
    const addproj = await db.projects.create({
        data: {
            project: projectName
        }
    })
    return addproj.project_id
}

//===============================================================================
// COST_CENTERS
//===============================================================================

export async function getCostCenters(cId: number) {
    const cost_centers = await db.cost_centers.findMany({
        where: {
            company_id: cId
        }
    })
    return cost_centers
}
