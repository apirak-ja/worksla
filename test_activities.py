import httpx
import json
import urllib3
urllib3.disable_warnings()

# Get activities from OpenProject directly
url = 'https://hosp.wu.ac.th/cmms/api/v3/work_packages/34909/activities'
headers = {
    'Authorization': 'Basic YXBpcmFrajphcGlyYWtAcGQ='
}

response = httpx.get(url, headers=headers, verify=False, timeout=10)
data = response.json()

# Print first activity with details
if '_embedded' in data and 'elements' in data['_embedded']:
    activities = data['_embedded']['elements']
    print(f"Total activities: {len(activities)}\n")
    
    for i, activity in enumerate(activities[:2]):  # First 2 activities
        print(f"{'='*80}")
        print(f"Activity #{i+1}")
        print(f"{'='*80}")
        print(f"ID: {activity.get('id')}")
        print(f"Created At: {activity.get('createdAt')}")
        print(f"User: {activity.get('_links', {}).get('user', {}).get('title')}")
        print(f"Notes (raw): {activity.get('notes', {}).get('raw', '')}")
        print(f"\nDetails ({len(activity.get('details', []))} items):")
        
        for j, detail in enumerate(activity.get('details', [])[:5]):
            print(f"\n  Detail #{j+1}:")
            print(json.dumps(detail, indent=4))
        
        print("\n")
