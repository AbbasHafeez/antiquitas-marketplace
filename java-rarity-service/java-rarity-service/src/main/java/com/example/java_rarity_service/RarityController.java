package com.example.javararityservice;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/check-rarity")
// For development, allow all origins. Configure properly for production.
@CrossOrigin(origins = "*")
public class RarityController {

    private final Random random = new Random();

    @PostMapping
    public Map<String, Object> checkRarity(@RequestBody Map<String, String> payload) {
        String itemName = payload.getOrDefault("name", "Unknown Item");
        String category = payload.getOrDefault("category", "General");

        // Dummy logic for rarity
        String[] rarityLevels = {"Common", "Uncommon", "Rare", "Very Rare", "Mythical"};
        String rarity;
        if (category.equalsIgnoreCase("unique") || itemName.toLowerCase().contains("one-of-a-kind")) {
            rarity = "Mythical";
        } else {
            rarity = rarityLevels[random.nextInt(rarityLevels.length -1)]; // Avoid Mythical unless specific
        }

        System.out.println("Received for rarity check: " + itemName + ". Determined rarity: " + rarity);
        return Map.of(
            "itemName", itemName,
            "rarityLevel", rarity,
            "message", "Rarity determined by Java Rarity Service"
        );
    }
}