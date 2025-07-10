

const dishes = [
  { name: 'Chicken Curry', description: 'Spicy curry with basmati rice' },
  { name: 'Caesar Salad', description: 'Crisp romaine with parmesan and croutons' },
  { name: 'Chocolate Cake', description: 'Rich dessert topped with berries' },
] as const

function MenuPage() {
  return (
    <div>
      <h2>Menu</h2>
      <ul>
        {dishes.map((d) => (
          <li key={d.name}>
            <strong>{d.name}</strong> - {d.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuPage
