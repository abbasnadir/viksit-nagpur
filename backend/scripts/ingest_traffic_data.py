import pandas as pd
import json
import os

def parse_tomtom_geojson(file_path: str):
    """
    Parses the raw GeoJSON from TomTom MOVE portal into a clean Pandas DataFrame
    ready for AI training.
    """
    print(f"Loading TomTom GeoJSON from: {file_path}")
    
    with open(file_path, 'r') as f:
        data = json.load(f)

    # The first feature contains metadata about timeSets
    metadata = data['features'][0]['properties']
    time_set_map = {ts['@id']: ts['name'] for ts in metadata.get('timeSets', [])}
    print(f"Detected Time Sets: {time_set_map}")

    records = []
    
    # Loop through actual road segment features (skip the first metadata feature)
    for feature in data['features'][1:]:
        props = feature['properties']
        geom = feature['geometry']
        
        segment_id = props.get('segmentId')
        speed_limit = props.get('speedLimit')
        frc = props.get('frc')
        street_name = props.get('streetName', 'Unknown')
        
        # Each segment has multiple time results (one for each time bucket)
        for time_result in props.get('segmentTimeResults', []):
            time_set_id = time_result.get('timeSet')
            time_name = time_set_map.get(time_set_id, "Unknown")
            
            harmonic_speed = time_result.get('harmonicAverageSpeed')
            sample_size = time_result.get('sampleSize')
            
            # Skip rows with no speed data or very low sample size to avoid noise
            if not harmonic_speed or not speed_limit or sample_size < 5:
                continue
                
            # Calculate the AI Risk Factor (Congestion Ratio)
            # Formula: (Speed Limit - Harmonic Speed) / Speed Limit
            # (Using speedLimit as proxy for FreeFlow speed if FreeFlow isn't available)
            congestion_ratio = (speed_limit - harmonic_speed) / speed_limit
            
            # Ensure it's not negative (if cars are speeding)
            congestion_ratio = max(0.0, round(congestion_ratio, 3))
            
            # Create a simple risk label for classification
            if congestion_ratio < 0.2:
                risk_label = "LOW"
            elif congestion_ratio < 0.4:
                risk_label = "MODERATE"
            elif congestion_ratio < 0.6:
                risk_label = "HIGH"
            else:
                risk_label = "SEVERE"

            records.append({
                "segment_id": segment_id,
                "street_name": street_name,
                "frc": frc,
                "time_window": time_name,
                "speed_limit": speed_limit,
                "harmonic_speed": harmonic_speed,
                "sample_size": sample_size,
                "congestion_ratio": congestion_ratio,
                "risk_label": risk_label,
                "geometry_coords": str(geom['coordinates']) if geom else None
            })

    df = pd.DataFrame(records)
    print(f"\nSuccessfully parsed {len(df)} training records!")
    
    # Display a sample of the prepared AI data
    print("\n--- AI Training Data Sample ---")
    print(df[['street_name', 'time_window', 'speed_limit', 'harmonic_speed', 'congestion_ratio', 'risk_label']].head(10))
    
    # Save the cleaned dataset
    output_path = file_path.replace(".geojson", "_cleaned.csv")
    df.to_csv(output_path, index=False)
    print(f"\nCleaned dataset saved to: {output_path}")
    
    return df

if __name__ == "__main__":
    # Adjust path if script is run from inside the backend folder vs root folder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sample_path = os.path.join(base_dir, "data", "jobs_9732280_results_TrafficFlow.geojson")
    
    if os.path.exists(sample_path):
        parse_tomtom_geojson(sample_path)
    else:
        print(f"File not found: {sample_path}")
