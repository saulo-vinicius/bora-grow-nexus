
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plant, Calculator, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto">
      <div className="space-y-4 py-4">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{t("app.name")}</h1>
          <p className="text-xl text-muted-foreground">{t("app.subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plant className="h-5 w-5" />
                {t("menu.myPlants")}
              </CardTitle>
              <CardDescription>
                Track your plant growth and maintain daily logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Monitor your plants' progress, record environmental conditions, and track nutrient applications.</p>
              <Button asChild className="w-full">
                <Link to="/plants">{t("menu.myPlants")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t("menu.calculator")}
              </CardTitle>
              <CardDescription>
                Calculate precise nutrient mixes for your plants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Create balanced nutrient solutions with our advanced calculator based on HydroBuddy technology.</p>
              <Button asChild className="w-full">
                <Link to="/calculator">{t("menu.calculator")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("menu.recipes")}
              </CardTitle>
              <CardDescription>
                Save and manage your nutrient recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Store your favorite nutrient mixes and easily apply them to your plants when needed.</p>
              <Button asChild className="w-full">
                <Link to="/recipes">{t("menu.recipes")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
