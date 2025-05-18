
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UpgradePage = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "For hobbyists and beginners",
      features: [
        "2 plants maximum",
        "Basic nutrient calculator",
        "Manual data entry",
        "Community support"
      ],
      action: "Current Plan",
      disabled: true
    },
    {
      name: "Premium",
      price: "9.99",
      period: "monthly",
      description: "For serious growers",
      features: [
        "Unlimited plants",
        "Advanced nutrient calculator",
        "Custom substances",
        "Recipe sharing",
        "Priority support",
        "Data backup"
      ],
      action: "Upgrade Now",
      highlight: true
    },
    {
      name: "Annual",
      price: "99.99",
      period: "yearly",
      description: "Save 17% compared to monthly",
      features: [
        "All Premium features",
        "API access",
        "Detailed analytics",
        "Priority support",
        "Early access to new features"
      ],
      action: "Upgrade Now"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">{t("profile.upgradeAccount")}</h1>
        <p className="text-muted-foreground">Choose the plan that's right for you</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`flex flex-col ${plan.highlight ? 'border-primary shadow-lg' : ''}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl">
                {plan.name}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.highlight ? "default" : "outline"}
                disabled={plan.disabled}
              >
                {plan.action}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpgradePage;
