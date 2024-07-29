let submit1=document.getElementById("form")

submit1.addEventListener("submit", (e) => {
    e.preventDefault()
    let titlec = title.value
     let descc = desc.value
    console.log(titlec)
    console.log(descc)
    debugger
    localStorage.setItem("todo", JSON.stringify([titlec, descc]))
    console.log(e)
    todo.innerHTML = `
    <table style="border: 1px solid black; text-align: center"">
    <tr>
    <th>Todo list title</th>
    <th>description</th>
    </tr>
    <tr>
    <td style="padding:15px">${titlec} </td>
    <td> ${descc}</td>
     </tr>
     </table>
    `
    title.value = ""
    desc.value = ""
  })
  
  deleteBtn.addEventListener("click", (e) => {
    alert("you are deleted your todo list");
    e.preventDefault()
    localStorage.removeItem("todo")
    todo.innerHTML = ""
   
  })

  