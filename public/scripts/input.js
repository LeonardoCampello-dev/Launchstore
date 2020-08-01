const input = document.querySelector('input[name="price"]')

input.addEventListener("keydown", e => {
    
    setTimeout(() => {
        let { value } = e.target

        value = value.replace(/\D/g, "") 

        value = Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value/100)
        
        e.target.value = value
    }, 1)
})