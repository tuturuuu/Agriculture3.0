from web3 import Web3
from faker import Faker
import random
import mysql.connector
from datetime import datetime, timedelta
import json

# ✅ Initialize Faker
fake = Faker()

# ✅ Connect to MySQL
conn = mysql.connector.connect(user='agricultureWeb', password='admin', host='localhost', database='innovation')
cursor = conn.cursor()

# ✅ Connect to Ethereum
WEB3_PROVIDER = "http://127.0.0.1:8545" 
PRIVATE_KEY = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"
WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

web3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

# ✅ Load Contract ABI
with open("../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json", "r") as file:  # Ensure ABI file is present
    contract_data = json.load(file)  
    abi = contract_data.get("abi")

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

# ✅ Sample Data
categories = ["Arabica", "Robusta", "Espresso", "Liberica", "Excelsa", "Maragogype", "Pacamara", "Caturra"]
regions = ["Colombia", "Ethiopia", "Guatemala", "Brazil"]
processing_methods = ["Washed", "Natural", "Honey", "Wet-Hulled"]
transformation_types = ["Roasting", "Grinding", "Blending", "Sorting", "Packaging"]
one_year_ago = datetime.today().date() - timedelta(days=365)
two_months_ago = datetime.today().date() - timedelta(days=60)

def get_or_create_category(cursor, category_name):
    """Ensure category exists or create a new one."""
    cursor.execute("SELECT categoryId FROM Category WHERE name = %s", (category_name,))
    category_result = cursor.fetchone()

    if category_result is None:
        cursor.execute("INSERT INTO Category (name) VALUES (%s)", (category_name,))
        conn.commit()
        return cursor.lastrowid
    return category_result[0]

# ✅ Generate Products and Mint NFTs
num_products = 200  # Adjust as needed
batch_ids = []  # Store batch IDs for later transformation

for _ in range(num_products):
    name = fake.word().capitalize() + " Coffee"
    category_id = get_or_create_category(cursor, random.choice(categories))
    harvest_date = fake.date_between(start_date=one_year_ago, end_date=two_months_ago)
    expiration_date = harvest_date + timedelta(days=random.randint(90, 365))
    owner_address = fake.hexify(text="0x^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    region = random.choice(regions)
    image_src = f"coffee-{_ + 1}.jpg"
    quantity = random.randint(50, 200)
    price = int(round(random.uniform(0.01, 0.2), 4) * 10**18)
    description = f"A premium {random.choice(categories)} coffee from {region}."

    # ✅ Call createBatch on blockchain first to get the batchId
    nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)
    txn = contract.functions.createBatch(
        True, price, region, quantity
    ).build_transaction({
        "from": WALLET_ADDRESS,
        "gas": 3000000,
        "gasPrice": web3.to_wei("5", "gwei"),
        "nonce": nonce
    })
    
    signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

    # ✅ Get Batch ID from Blockchain
    blockchain_batch_id = contract.functions.batchCounter().call()
    batch_ids.append(blockchain_batch_id)
    
    # ✅ Store Product in MySQL with batchId
    cursor.execute("""
        INSERT INTO products (productId, name, categoryId, harvestDate, expirationDate, ownerAddress, 
                               region, imageSrc, quantity, price, description, isForSale)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (blockchain_batch_id, name, category_id, harvest_date, expiration_date, owner_address, 
          region, image_src, quantity, price, description, True))
    conn.commit()
    product_id = cursor.lastrowid  
    
    print(f"✅ Created Product ID: {product_id} with Batch ID: {blockchain_batch_id} - {name} from {region}")

print(f"✅ Successfully generated {num_products} coffee products and minted NFTs!")

# ✅ Transform Batches
num_transformations = min(15, len(batch_ids))  # Transform up to 15 batches or all if less
transformed_batch_ids = []

for i in range(num_transformations):
    # Select a random batch to transform
    source_batch_id = random.choice(batch_ids)
    
    try:
        # Get batch details
        batch = contract.functions.batches(source_batch_id).call()
        original_location = batch[2]  # location field
        original_quantity = batch[3]  # quantity field
        available_quantity = batch[4]  # available field - Use available instead of total quantity
        
        # Check if batch is in a valid state for transformation
        batch_state = batch[8]  # state field
        if batch_state != 0:  # BatchState.Available = 0
            print(f"⚠️ Batch {source_batch_id} is not in Available state, skipping")
            continue
            
        # Check if there's enough available quantity
        if available_quantity <= 0:
            print(f"⚠️ Batch {source_batch_id} has no available quantity, skipping")
            continue
            
        # Calculate a reasonable transformation quantity (not exceeding available)
        new_quantity = max(1, int(available_quantity * random.uniform(0.1, 0.8)))
        
        # Double-check that we're not trying to use more than available
        if new_quantity > available_quantity:
            new_quantity = available_quantity
            
        new_location = random.choice(regions)
        transformation_type = random.choice(transformation_types)
        processing_method = random.choice(processing_methods)
        
        # Generate transformation details
        transformation_details = f"{transformation_type} process using {processing_method} method. Used {new_quantity} units from batch {source_batch_id}."
        
        # Call transformBatch function
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)
        txn = contract.functions.transformBatch(
            source_batch_id,
            new_quantity,
            new_location,
            transformation_details
        ).build_transaction({
            "from": WALLET_ADDRESS,
            "gas": 3000000,
            "gasPrice": web3.to_wei("5", "gwei"),
            "nonce": nonce
        })
        
        signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get the new batch ID
        new_batch_id = contract.functions.batchCounter().call()
        transformed_batch_ids.append(new_batch_id)
        
        # ✅ Create a new product entry for the transformed batch
        name = fake.word().capitalize() + " " + transformation_type + " Coffee"
        category_id = get_or_create_category(cursor, random.choice(categories))
        harvest_date = fake.date_between(start_date=one_year_ago, end_date=two_months_ago)
        expiration_date = harvest_date + timedelta(days=random.randint(120, 400))  # Longer shelf life for processed coffee
        owner_address = WALLET_ADDRESS  # Owner is now our wallet
        image_src = f"coffee-{i + 1}.jpg"
        price = int(round(random.uniform(0.05, 0.3), 4) * 10**18)  # Higher price for processed coffee
        description = f"A premium {transformation_type} coffee processed using {processing_method} method from {new_location}."
        
        # ✅ Insert the transformed product with batchId
        cursor.execute("""
            INSERT INTO products (productId, name, categoryId, harvestDate, expirationDate, ownerAddress, 
                                 region, imageSrc, quantity, price, description, isForSale)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (new_batch_id, name, category_id, harvest_date, expiration_date, owner_address, 
              new_location, image_src, new_quantity, price, description, False))  # Not for sale initially
        conn.commit()
        transformed_product_id = cursor.lastrowid
        
        print(f"✅ Created Transformed Product ID: {transformed_product_id} with Batch ID: {new_batch_id} - {name}")
        print(f"✅ Transformed Batch {source_batch_id} -> {new_batch_id}: {transformation_type} in {new_location}, used {new_quantity}/{available_quantity} units")
        
    except Exception as e:
        print(f"❌ Failed to transform batch {source_batch_id}: {str(e)}")

# ✅ List a few transformed batches for sale
for batch_id in transformed_batch_ids[:5]:  # List first 5 transformed batches
    try:
        new_price = int(round(random.uniform(0.05, 0.3), 4) * 10**18)  # Higher price for processed coffee
        
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)
        txn = contract.functions.toggleSale(
            batch_id,
            True,  # isForSale = true
            new_price
        ).build_transaction({
            "from": WALLET_ADDRESS,
            "gas": 3000000,
            "gasPrice": web3.to_wei("5", "gwei"),
            "nonce": nonce
        })
        
        signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Update the product record to show it's for sale with new price
        cursor.execute("""
            UPDATE products SET isForSale = TRUE, price = %s
            WHERE productId = %s
        """, (new_price, batch_id))
        conn.commit()
        
        print(f"✅ Listed transformed batch {batch_id} for sale at price {web3.from_wei(new_price, 'ether')} ETH")
        
    except Exception as e:
        print(f"❌ Failed to list transformed batch {batch_id}: {str(e)}")

print(f"✅ Successfully transformed {len(transformed_batch_ids)} batches!")
print(f"✅ Listed {min(5, len(transformed_batch_ids))} transformed batches for sale")

# ✅ Fetch existing user IDs
cursor.execute("SELECT userId FROM users")
user_ids = [row[0] for row in cursor.fetchall()]

# ✅ Fetch product IDs by using batchIds
cursor.execute("SELECT id, productId FROM products")
product_batch_mapping = {row[1]: row[0] for row in cursor.fetchall()}

# ✅ Generate Shopping Cart Items
if user_ids and batch_ids:
    shopping_cart_data = []
    for _ in range(20):  
        user_id = random.choice(user_ids)
        selected_batch_id = random.choice(batch_ids + transformed_batch_ids[:5])  # Use both original and transformed batches
        
        # Get the corresponding product ID from the mapping
        if selected_batch_id in product_batch_mapping:
            product_id = product_batch_mapping[selected_batch_id]
            quantity = random.randint(1, 5)
            added_at = fake.date_time_this_year()
            shopping_cart_data.append((user_id, product_id, quantity, added_at))

    if shopping_cart_data:
        cursor.executemany("""
            INSERT INTO shoppingCart (userId, productId, quantity, addedAt) 
            VALUES (%s, %s, %s, %s)
        """, shopping_cart_data)
        conn.commit()
        print(f"✅ Successfully added {len(shopping_cart_data)} shopping cart items!")
    else:
        print("⚠️ No shopping cart items were generated.")

# ✅ Generate Favorites
if user_ids and batch_ids:
    favorites_data = []
    for _ in range(10):  
        user_id = random.choice(user_ids)
        selected_batch_id = random.choice(batch_ids + transformed_batch_ids)
        
        # Get the corresponding product ID from the mapping
        if selected_batch_id in product_batch_mapping:
            product_id = product_batch_mapping[selected_batch_id]
            added_at = fake.date_time_this_year()
            favorites_data.append((user_id, product_id, added_at))

    if favorites_data:
        cursor.executemany("""
            INSERT INTO favorites (userId, productId, addedAt) 
            VALUES (%s, %s, %s)
        """, favorites_data)
        conn.commit()
        print(f"✅ Successfully added {len(favorites_data)} favorite items!")
    else:
        print("⚠️ No favorites were generated.")

cursor.close()
conn.close()